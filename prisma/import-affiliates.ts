// Importa el listado de socios de ADECLA desde prisma/affiliates-seed-data.json
// (generado a partir del Excel que maneja Katherin, nunca commiteado — ver
// .gitignore). Idempotente: usa el nombre de la empresa como clave para no
// duplicar en reimportaciones.
//
// El archivo es el listado completo, así que lo que no aparece en él deja de
// ser socio: esas filas pasan a INACTIVO y salen del formulario, pero se
// conservan porque puede haber inscripciones viejas apuntando a ellas.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

interface AffiliateRow {
  sourceId: string | null;
  name: string;
  // Nombre con el que está guardada hoy, cuando el listado la renombró. Se
  // renombra la fila existente en vez de crear otra, para no partirle el
  // historial ni el cupón de pareja gratis a la empresa.
  previousName?: string | null;
  affiliationType: "CONSTRUCTOR" | "PROVEEDOR" | "DESARROLLADOR" | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
}

// El Excel se reescribe a mano cada año, así que el mismo socio aparece con
// tildes, comas o espacios de más según quién lo escribió. Comparar los
// nombres en crudo hacía que "Arve Real Estate , Srl  (consarve)" y su
// versión con un espacio menos se guardaran como dos empresas distintas.
function claveNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function main() {
  const dataPath = path.join(__dirname, "affiliates-seed-data.json");
  if (!fs.existsSync(dataPath)) {
    throw new Error(
      `No se encontró ${dataPath}. Genera el archivo a partir del Excel de socios antes de importar.`
    );
  }
  const rows: AffiliateRow[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const guardados = await prisma.affiliate.findMany({
    select: { id: true, name: true },
  });
  const porClave = new Map(guardados.map((a) => [claveNombre(a.name), a]));

  let created = 0;
  let updated = 0;
  let renamed = 0;
  const vigentes: string[] = [];

  for (const row of rows) {
    const existing =
      porClave.get(claveNombre(row.name)) ??
      (row.previousName ? porClave.get(claveNombre(row.previousName)) : undefined);

    const data = {
      sourceId: row.sourceId,
      name: row.name,
      affiliationType: row.affiliationType,
      contactName: row.contactName,
      phone: row.phone,
      email: row.email,
      status: row.status,
    };

    if (existing) {
      await prisma.affiliate.update({ where: { id: existing.id }, data });
      if (existing.name !== row.name) renamed++;
      updated++;
      vigentes.push(existing.id);
    } else {
      const creado = await prisma.affiliate.create({ data });
      created++;
      vigentes.push(creado.id);
    }
  }

  const bajas = await prisma.affiliate.updateMany({
    where: { id: { notIn: vigentes }, status: "ACTIVO" },
    data: { status: "INACTIVO" },
  });

  console.log(
    `✔ Afiliados: ${created} nuevos, ${updated} actualizados (${renamed} renombrados), ${bajas.count} dados de baja`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
