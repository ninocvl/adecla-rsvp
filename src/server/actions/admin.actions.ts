"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/server/services/email";
import { STATUS_LABELS } from "@/lib/constants";
import { puedeEditar } from "@/lib/permissions";

const changeStatusSchema = z.object({
  registrationId: z.string().min(1),
  toStatus: z.enum([
    "PROFORMA_GENERADA",
    "PENDIENTE_PAGO",
    "EN_REVISION",
    "CONFIRMADA",
    "CANCELADA",
  ]),
  note: z
    .string()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .transform((v) => (v ? v.trim() || undefined : undefined)),
});

export type ChangeStatusInput = z.input<typeof changeStatusSchema>;
export type ChangeStatusResult = { ok: true } | { ok: false; error: string };

class CapacityError extends Error {}
class CodeMismatchError extends Error {}

export async function changeRegistrationStatusAction(
  input: ChangeStatusInput
): Promise<ChangeStatusResult> {
  const session = await auth();
  if (!session?.user || !puedeEditar(session.user.role)) {
    return { ok: false, error: "Solo el administrador puede cambiar estados." };
  }
  const actorId = session.user.id;

  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }
  const { registrationId, toStatus, note } = parsed.data;

  try {
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: registrationId },
        include: { company: true },
      });
      if (!reg) throw new Error("Inscripción no encontrada");
      if (reg.status === toStatus) return reg;

      // Cancelar libera los cupos; salir de cancelada los vuelve a tomar
      // (con verificación de capacidad, por si ya se llenó la fecha).
      if (toStatus === "CANCELADA") {
        await tx.$executeRaw`
          UPDATE "EventDate"
          SET "reservedCount" = GREATEST("reservedCount" - ${reg.quantity}, 0)
          WHERE "id" = ${reg.eventDateId}
        `;
      } else if (reg.status === "CANCELADA") {
        const retaken = await tx.$executeRaw`
          UPDATE "EventDate"
          SET "reservedCount" = "reservedCount" + ${reg.quantity}
          WHERE "id" = ${reg.eventDateId}
            AND "reservedCount" + ${reg.quantity} <= "capacity"
        `;
        if (retaken === 0) throw new CapacityError();
      }

      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: {
          status: toStatus,
          history: {
            create: {
              fromStatus: reg.status,
              toStatus,
              note,
              changedById: actorId,
            },
          },
        },
        include: { company: true },
      });
      return updated;
    });

    if (registration.status === toStatus) {
      emailService
        .sendStatusChanged({
          to: registration.company.email,
          contactName: registration.company.contactName,
          companyName: registration.company.legalName,
          registrationCode: registration.code,
          status: toStatus,
          newStatusLabel: STATUS_LABELS[toStatus],
        })
        .catch((e) =>
          console.error("Error enviando correo de cambio de estado:", e)
        );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/inscripciones");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    if (error instanceof CapacityError) {
      return {
        ok: false,
        error:
          "No se puede reactivar: la fecha ya no tiene cupos suficientes.",
      };
    }
    console.error("Error cambiando estado:", error);
    return { ok: false, error: "No se pudo cambiar el estado." };
  }
}

export type RegistrationActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Libera los cupos que tenía tomados una inscripción. Se usa al archivar y al
 * borrar. Una inscripción cancelada ya los había soltado al cambiar de
 * estado, así que no se descuenta dos veces.
 */
async function liberarCupos(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  registro: { eventDateId: string; quantity: number; status: string }
) {
  if (registro.status === "CANCELADA") return;
  await tx.$executeRaw`
    UPDATE "EventDate"
    SET "reservedCount" = GREATEST("reservedCount" - ${registro.quantity}, 0)
    WHERE "id" = ${registro.eventDateId}
  `;
}

/**
 * Devuelve el cupón de pareja gratis a la empresa afiliada cuando la
 * inscripción que lo canjeó se archiva o se borra. Un error administrativo no
 * debería quemarle el beneficio a la empresa.
 */
async function liberarCupon(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  registrationId: string
) {
  // Borrar el canje le devuelve la pareja gratis a la empresa: el único por
  // afiliada vuelve a quedar libre.
  await tx.couponRedemption.deleteMany({ where: { registrationId } });
}

function revalidarPanel() {
  revalidatePath("/admin");
  revalidatePath("/admin/inscripciones");
  revalidatePath("/admin/participantes");
  revalidatePath("/dashboard");
}

/**
 * Archivar: la inscripción sale del panel y suelta el cupo, pero la fila
 * queda para auditar o restaurar. Es la vía reversible.
 */
export async function archiveRegistrationAction(
  registrationId: string
): Promise<RegistrationActionResult> {
  const session = await auth();
  if (!puedeEditar(session?.user?.role)) {
    return { ok: false, error: "Solo el administrador puede archivar." };
  }
  if (!registrationId) return { ok: false, error: "Datos inválidos." };

  try {
    await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: registrationId },
        select: {
          id: true,
          eventDateId: true,
          quantity: true,
          status: true,
          archivedAt: true,
        },
      });
      if (!reg) throw new Error("Inscripción no encontrada");
      if (reg.archivedAt) return; // ya estaba archivada: no soltar cupos otra vez
      await liberarCupos(tx, reg);
      await liberarCupon(tx, reg.id);
      await tx.registration.update({
        where: { id: reg.id },
        data: { archivedAt: new Date() },
      });
    });
    revalidarPanel();
    return { ok: true };
  } catch (error) {
    console.error("Error archivando inscripción:", error);
    return { ok: false, error: "No se pudo archivar la inscripción." };
  }
}

/** Devuelve al panel una inscripción archivada y vuelve a tomar sus cupos. */
export async function restoreRegistrationAction(
  registrationId: string
): Promise<RegistrationActionResult> {
  const session = await auth();
  if (!puedeEditar(session?.user?.role)) {
    return { ok: false, error: "Solo el administrador puede restaurar." };
  }
  if (!registrationId) return { ok: false, error: "Datos inválidos." };

  try {
    await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: registrationId },
        select: {
          id: true,
          eventDateId: true,
          quantity: true,
          status: true,
          archivedAt: true,
        },
      });
      if (!reg) throw new Error("Inscripción no encontrada");
      if (!reg.archivedAt) return;
      // Una cancelada no tenía cupos tomados, así que al volver tampoco los toma.
      if (reg.status !== "CANCELADA") {
        const retomados = await tx.$executeRaw`
          UPDATE "EventDate"
          SET "reservedCount" = "reservedCount" + ${reg.quantity}
          WHERE "id" = ${reg.eventDateId}
            AND "reservedCount" + ${reg.quantity} <= "capacity"
        `;
        if (retomados === 0) throw new CapacityError();
      }
      await tx.registration.update({
        where: { id: reg.id },
        data: { archivedAt: null },
      });
    });
    revalidarPanel();
    return { ok: true };
  } catch (error) {
    if (error instanceof CapacityError) {
      return {
        ok: false,
        error: "No se puede restaurar: la fecha ya no tiene cupos suficientes.",
      };
    }
    console.error("Error restaurando inscripción:", error);
    return { ok: false, error: "No se pudo restaurar la inscripción." };
  }
}

/**
 * Borrado real: elimina la fila y, en cascada, participantes, proforma e
 * historial. No se puede deshacer — por eso la interfaz pide confirmar dos
 * veces y escribir el código de la inscripción.
 *
 * Se exige el código como segunda confirmación también aquí, en el servidor:
 * un diálogo se puede saltar, esta comprobación no.
 */
export async function deleteRegistrationAction(
  registrationId: string,
  codigoConfirmacion: string
): Promise<RegistrationActionResult> {
  const session = await auth();
  if (!puedeEditar(session?.user?.role)) {
    return { ok: false, error: "Solo el administrador puede borrar." };
  }
  if (!registrationId) return { ok: false, error: "Datos inválidos." };

  try {
    await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: registrationId },
        select: {
          id: true,
          code: true,
          eventDateId: true,
          quantity: true,
          status: true,
          archivedAt: true,
        },
      });
      if (!reg) throw new Error("Inscripción no encontrada");
      if (codigoConfirmacion.trim().toUpperCase() !== reg.code.toUpperCase()) {
        throw new CodeMismatchError();
      }
      // Si ya estaba archivada, los cupos se soltaron al archivarla.
      if (!reg.archivedAt) await liberarCupos(tx, reg);
      // El onDelete: SetNull del FK limpiaría usedByRegistrationId, pero no
      // usedAt: sin esto el cupón quedaría marcado como usado para siempre.
      await liberarCupon(tx, reg.id);
      await tx.registration.delete({ where: { id: reg.id } });
    });
    revalidarPanel();
    return { ok: true };
  } catch (error) {
    if (error instanceof CodeMismatchError) {
      return {
        ok: false,
        error: "El código no coincide con el de la inscripción.",
      };
    }
    console.error("Error borrando inscripción:", error);
    return { ok: false, error: "No se pudo borrar la inscripción." };
  }
}
