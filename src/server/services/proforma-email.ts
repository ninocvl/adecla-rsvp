import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { emailService } from "@/server/services/email";
import { renderProformaPdf } from "@/lib/pdf/render-proforma-pdf";
import type { ProformaSnapshot } from "@/lib/pdf/proforma-types";
import { formatDop, formatEventDate, formatUsd } from "@/lib/format";

export type EnvioProforma = { ok: true } | { ok: false; error: string };

/**
 * Manda el correo con la(s) proforma(s) de una o varias inscripciones de la
 * misma empresa y deja el resultado en el historial de cada una, para que el
 * admin vea si salió o por qué no (los logs de Vercel no sirven para esto: se
 * pierden y nadie los mira cuando una persona dice "no me llegó").
 *
 * Nunca lanza: devuelve el motivo del fallo.
 */
export async function enviarProformaPorCorreo(
  registrationIds: string[],
  actorId?: string
): Promise<EnvioProforma> {
  const registrations = await prisma.registration.findMany({
    where: { id: { in: registrationIds } },
    include: {
      company: true,
      event: true,
      eventDate: true,
      proforma: true,
    },
    orderBy: { eventDate: { date: "asc" } },
  });
  const conProforma = registrations.filter((r) => r.proforma);
  if (conProforma.length === 0) {
    return { ok: false, error: "Esta inscripción no tiene proforma." };
  }

  const resultado = await enviar(conProforma);

  const nota = resultado.ok
    ? `Correo de proforma enviado a ${conProforma[0].company.email}`
    : `El correo de proforma NO salió: ${resultado.error}`;
  try {
    await prisma.statusHistory.createMany({
      data: conProforma.map((r) => ({
        registrationId: r.id,
        fromStatus: r.status,
        toStatus: r.status,
        changedById: actorId ?? null,
        note: nota,
      })),
    });
  } catch (e) {
    // El historial es un apoyo: si falla, el envío ya ocurrió y no se debe
    // reportar como error.
    console.error("No se pudo guardar el resultado del correo:", e);
  }
  return resultado;
}

type InscripcionConProforma = Prisma.RegistrationGetPayload<{
  include: { company: true; event: true; eventDate: true; proforma: true };
}>;

async function enviar(
  registrations: InscripcionConProforma[]
): Promise<EnvioProforma> {
  // Con el servicio de consola no sale nada: marcarlo como enviado sería
  // mentir en el historial.
  if (process.env.EMAIL_ENABLED !== "true") {
    return {
      ok: false,
      error: "el envío de correo no está activado (EMAIL_ENABLED).",
    };
  }
  try {
    const snapshots = registrations.map(
      (r) => r.proforma!.snapshot as unknown as ProformaSnapshot
    );
    // Cada fecha puede tener su propio total (una está exenta de ITBIS y
    // otra no), así que el total del correo se suma desde los snapshots
    // reales.
    const totalUsd = snapshots.reduce((s, x) => s + Number(x.totalUsd), 0);
    const totalDop = snapshots.reduce((s, x) => s + Number(x.totalDopRef), 0);
    const attachments = await Promise.all(
      registrations.map(async (r, i) => ({
        filename: `proforma-${r.code}.pdf`,
        content: await renderProformaPdf(snapshots[i]),
      }))
    );
    const primera = registrations[0];
    await emailService.sendProformaCreated({
      to: primera.company.email,
      companyName: primera.company.legalName,
      contactName: primera.company.contactName,
      registrationCode: registrations.map((r) => r.code).join(", "),
      eventName: primera.event.name,
      eventDate: registrations
        .map((r) => formatEventDate(r.eventDate.date))
        .join(" y "),
      totalUsd: formatUsd(totalUsd),
      totalDopRef: formatDop(totalDop),
      attachments,
    });
    return { ok: true };
  } catch (e) {
    console.error("Error enviando correo de proforma:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message.slice(0, 200) : "No se pudo enviar.",
    };
  }
}
