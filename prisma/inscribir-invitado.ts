/**
 * Inscribe a mano a un invitado de patrocinador, para cuando alguien pide el
 * cupo por WhatsApp y no va a llenar el formulario.
 *
 * Hace lo mismo que la inscripción normal: descuenta cupo con el tope del
 * aforo, genera el código correlativo, guarda los jugadores y deja el
 * historial de estado. Un invitado de patrocinador no paga ni lleva
 * proforma, así que no se genera ninguna.
 *
 * El documento de identidad no se pasa por parámetro: lo pide al ejecutar.
 * Los comandos quedan escritos en el historial de la terminal, y ese número
 * no tiene por qué quedar ahí.
 *
 * Por defecto SIMULA: hace todo y lo deshace, para que se pueda ver el
 * resultado antes de tocar la base. Con --confirmar lo guarda de verdad.
 *
 * Ejemplo:
 *   npx tsx prisma/inscribir-invitado.ts \
 *     --patrocinador="EMPRESA SRL" --rnc-patrocinador="1-31-31251-9" \
 *     --categoria=MASCULINO_C --empresa="Nombre de quien inscribe" \
 *     --contacto="Nombre" --correo=correo@ejemplo.com --telefono=8095551234 \
 *     --jugador="Nombre Apellido|correo@ejemplo.com" \
 *     --jugador="Otro Nombre|otro@ejemplo.com"
 */
import "dotenv/config";
import readline from "node:readline";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PADEL_CATEGORIES, PADEL_CATEGORY_LABELS } from "../src/lib/constants";
import { findMatchingSponsor } from "../src/lib/sponsors";
import { normalizeRnc } from "../src/lib/validations/registration.schema";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type Categoria = (typeof PADEL_CATEGORIES)[number];

function args(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (!m) continue;
    (out[m[1]] ??= []).push(m[2] ?? "true");
  }
  return out;
}

function preguntar(texto: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((r) =>
    rl.question(texto, (v) => {
      rl.close();
      r(v.trim());
    })
  );
}

function salir(msg: string): never {
  console.error(`\n${msg}`);
  process.exit(1);
}

async function main() {
  const a = args();
  const uno = (k: string) => a[k]?.[0];

  const patrocinador = uno("patrocinador");
  const rncPatrocinador = uno("rnc-patrocinador");
  const categoria = uno("categoria") as Categoria | undefined;
  const empresa = uno("empresa");
  const contacto = uno("contacto");
  const correo = uno("correo");
  const telefono = uno("telefono");
  const jugadores = (a["jugador"] ?? []).map((j) => {
    const [fullName, email] = j.split("|");
    return { fullName: (fullName ?? "").trim(), email: (email ?? "").trim() };
  });
  const confirmar = !!uno("confirmar");
  const eventoSlug = uno("evento") ?? "padel";

  if (!patrocinador || !rncPatrocinador) salir("Faltan --patrocinador y --rnc-patrocinador.");
  if (!categoria || !PADEL_CATEGORIES.includes(categoria))
    salir(`--categoria debe ser una de: ${PADEL_CATEGORIES.join(", ")}`);
  if (!empresa || !contacto || !correo || !telefono)
    salir("Faltan --empresa, --contacto, --correo o --telefono.");
  if (jugadores.length === 0 || jugadores.some((j) => !j.fullName))
    salir('Falta al menos un --jugador="Nombre Apellido|correo@ejemplo.com".');
  if (jugadores.length > 2) salir("Máximo dos jugadores por inscripción.");

  const documento = await preguntar(
    "Documento de quien inscribe (RNC, cédula o pasaporte): "
  );
  if (!documento) salir("Sin documento no se puede inscribir.");
  const rnc = normalizeRnc(documento);

  const event = await prisma.event.findUnique({
    where: { slug: eventoSlug },
    include: { dates: { where: { isActive: true }, orderBy: { date: "asc" } } },
  });
  if (!event) salir(`No existe el evento "${eventoSlug}".`);
  if (event.dates.length !== 1)
    salir(
      `El evento tiene ${event.dates.length} fechas activas; este script solo sirve cuando hay una.`
    );
  const eventDate = event.dates[0];

  // Igual que en el formulario: si el RNC está en la lista de patrocinadores
  // la inscripción queda confirmada; si no, entra en revisión para que
  // alguien la mire a mano.
  const sponsorRncVerified = !!findMatchingSponsor(rncPatrocinador);
  const status = sponsorRncVerified ? "CONFIRMADA" : "EN_REVISION";
  const cantidad = jugadores.length;

  const tasa = await prisma.setting.findUnique({
    where: { key: "usd_to_dop_rate" },
  });
  const exchangeRate = Number(tasa?.value ?? 60);

  console.log(`
Evento      ${event.name}
Fecha       ${eventDate.label} (${eventDate.date.toISOString().slice(0, 10)})
Cupos       ${eventDate.reservedCount} de ${eventDate.capacity} tomados
Categoría   ${PADEL_CATEGORY_LABELS[categoria]}
Patrocina   ${patrocinador} — ${rncPatrocinador} ${sponsorRncVerified ? "(en la lista)" : "(NO está en la lista)"}
Estado      ${status}
Jugadores   ${jugadores.map((j) => j.fullName).join(", ")}
Costo       sin costo, no genera proforma
`);

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const company = await tx.company.upsert({
        where: { rnc },
        create: {
          legalName: empresa,
          rnc,
          contactName: contacto,
          email: correo.toLowerCase(),
          phone: telefono,
        },
        update: {
          legalName: empresa,
          contactName: contacto,
          email: correo.toLowerCase(),
          phone: telefono,
        },
      });

      // El tope del aforo va en el propio UPDATE: si entre la comprobación y
      // la escritura entra otra inscripción, esta no pasa en vez de dejar el
      // evento sobrevendido.
      const cupos = await tx.$executeRaw`
        UPDATE "EventDate"
        SET "reservedCount" = "reservedCount" + ${cantidad}
        WHERE "id" = ${eventDate.id}
          AND "isActive" = true
          AND "reservedCount" + ${cantidad} <= "capacity"
      `;
      if (cupos === 0) throw new Error("No quedan cupos suficientes.");

      const { codeSeq, codePrefix } = await tx.event.update({
        where: { id: event.id },
        data: { codeSeq: { increment: 1 } },
        select: { codeSeq: true, codePrefix: true },
      });
      const code = `${codePrefix}-${new Date().getFullYear()}-${String(codeSeq).padStart(4, "0")}`;

      const registration = await tx.registration.create({
        data: {
          code,
          companyId: company.id,
          eventId: event.id,
          eventDateId: eventDate.id,
          padelCategory: categoria,
          isSponsorGuest: true,
          sponsorName: patrocinador,
          sponsorRnc: normalizeRnc(rncPatrocinador),
          sponsorRncVerified,
          status,
          quantity: cantidad,
          unitPriceUsd: "0.00",
          totalUsd: "0.00",
          exchangeRate: exchangeRate.toFixed(2),
          totalDopRef: "0.00",
          participants: {
            create: jugadores.map((j, i) => ({
              fullName: j.fullName,
              email: j.email || undefined,
              position: i + 1,
            })),
          },
          history: { create: { fromStatus: null, toStatus: status } },
        },
        select: { id: true, code: true },
      });

      if (!confirmar) {
        // Simulación: se deshace todo lo anterior al salir con error.
        throw new SoloSimulacion(registration.code);
      }
      return registration;
    });

    console.log(`✔ Inscripción creada: ${resultado.code}`);
    console.log(`  Panel: /admin/inscripciones/${resultado.id}`);
  } catch (e) {
    if (e instanceof SoloSimulacion) {
      console.log(`✔ Simulación correcta. Habría quedado como ${e.code}.`);
      console.log("  No se guardó nada. Repite el comando con --confirmar.");
      return;
    }
    salir(`No se pudo inscribir: ${(e as Error).message}`);
  }
}

class SoloSimulacion extends Error {
  constructor(public code: string) {
    super("simulacion");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
