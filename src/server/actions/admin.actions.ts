"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/server/services/email";
import { STATUS_LABELS } from "@/lib/constants";

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

export async function changeRegistrationStatusAction(
  input: ChangeStatusInput
): Promise<ChangeStatusResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { ok: false, error: "Solo el administrador puede cambiar estados." };
  }

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
              changedById: session.user.id,
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
          companyName: registration.company.legalName,
          registrationCode: registration.code,
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
