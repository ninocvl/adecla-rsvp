"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/server/services/email";
import {
  createRegistrationSchema,
  type CreateRegistrationInput,
} from "@/lib/validations/registration.schema";
import { AFFILIATION_LABELS } from "@/lib/constants";
import { formatDop, formatEventDate, formatUsd } from "@/lib/format";

export type CreateRegistrationResult =
  | { ok: true; registrationId: string; code: string }
  | { ok: false; error: string };

class CapacityError extends Error {}

export async function createRegistrationAction(
  input: CreateRegistrationInput
): Promise<CreateRegistrationResult> {
  const session = await auth();
  if (
    !session?.user ||
    session.user.role !== "COMPANY" ||
    !session.user.companyId
  ) {
    return { ok: false, error: "Inicia sesión con tu empresa para inscribirte." };
  }
  const companyId = session.user.companyId;

  const parsed = createRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const data = parsed.data;
  const quantity = data.participants.length;

  // La afiliación viene de la empresa (fijada al registrarse), nunca del
  // cliente: nadie puede enviar una categoría más barata que la suya.
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return { ok: false, error: "No encontramos los datos de tu empresa." };
  }

  const [event, eventDate, price, rateSetting] = await Promise.all([
    prisma.event.findUnique({ where: { id: data.eventId } }),
    prisma.eventDate.findUnique({ where: { id: data.eventDateId } }),
    prisma.eventPrice.findUnique({
      where: {
        eventId_affiliation: {
          eventId: data.eventId,
          affiliation: company.affiliationType,
        },
      },
    }),
    prisma.setting.findUnique({ where: { key: "usd_to_dop_rate" } }),
  ]);

  if (!event || event.status !== "PUBLISHED") {
    return { ok: false, error: "Este evento no está disponible." };
  }
  if (!eventDate || eventDate.eventId !== event.id || !eventDate.isActive) {
    return { ok: false, error: "Esa fecha no está disponible." };
  }
  if (!price || !price.isEnabled || price.amountUsd === null) {
    return {
      ok: false,
      error:
        "Tu categoría de afiliación todavía no tiene tarifa para este evento.",
    };
  }
  if (quantity > event.playersPerTeam) {
    return {
      ok: false,
      error: `Este evento admite máximo ${event.playersPerTeam} participantes por inscripción.`,
    };
  }

  const unitPriceUsd = Number(price.amountUsd);
  const exchangeRate = Number(rateSetting?.value ?? "60");
  const totalUsd = unitPriceUsd * quantity;
  const totalDopRef = totalUsd * exchangeRate;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Toma de cupos atómica: una sola sentencia condicional, sin carreras.
      const updated = await tx.$executeRaw`
        UPDATE "EventDate"
        SET "reservedCount" = "reservedCount" + ${quantity}
        WHERE "id" = ${eventDate.id}
          AND "isActive" = true
          AND "reservedCount" + ${quantity} <= "capacity"
      `;
      if (updated === 0) {
        throw new CapacityError();
      }

      const { codeSeq, codePrefix } = await tx.event.update({
        where: { id: event.id },
        data: { codeSeq: { increment: 1 } },
        select: { codeSeq: true, codePrefix: true },
      });
      const year = new Date().getFullYear();
      const code = `${codePrefix}-${year}-${String(codeSeq).padStart(4, "0")}`;

      const registration = await tx.registration.create({
        data: {
          code,
          companyId: company.id,
          eventId: event.id,
          eventDateId: eventDate.id,
          affiliation: company.affiliationType,
          status: "PROFORMA_GENERADA",
          quantity,
          unitPriceUsd: unitPriceUsd.toFixed(2),
          totalUsd: totalUsd.toFixed(2),
          exchangeRate: exchangeRate.toFixed(2),
          totalDopRef: totalDopRef.toFixed(2),
          participants: {
            create: data.participants.map((p, index) => ({
              fullName: p.fullName,
              email: p.email,
              phone: p.phone,
              position: index + 1,
            })),
          },
          history: {
            create: { fromStatus: null, toStatus: "PROFORMA_GENERADA" },
          },
        },
      });

      // Snapshot autocontenido: la proforma imprime siempre estos datos,
      // aunque después cambien precios, tasa o datos de la empresa.
      await tx.proforma.create({
        data: {
          registrationId: registration.id,
          number: code,
          snapshot: {
            code,
            issuedAt: new Date().toISOString(),
            company: {
              legalName: company.legalName,
              rnc: company.rnc,
              contactName: company.contactName,
              email: company.email,
              phone: company.phone,
            },
            event: {
              name: event.name,
              dateISO: eventDate.date.toISOString(),
              dateLabel: eventDate.label,
              venue: eventDate.venue,
            },
            affiliation: company.affiliationType,
            affiliationLabel: AFFILIATION_LABELS[company.affiliationType],
            quantity,
            unitPriceUsd: unitPriceUsd.toFixed(2),
            totalUsd: totalUsd.toFixed(2),
            exchangeRate: exchangeRate.toFixed(2),
            totalDopRef: totalDopRef.toFixed(2),
            participants: data.participants.map((p, index) => ({
              fullName: p.fullName,
              position: index + 1,
            })),
          },
        },
      });

      return registration;
    });

    // El correo nunca bloquea la inscripción.
    emailService
      .sendProformaCreated({
        to: company.email,
        companyName: company.legalName,
        contactName: company.contactName,
        registrationCode: result.code,
        eventName: event.name,
        eventDate: formatEventDate(eventDate.date),
        totalUsd: formatUsd(totalUsd),
        totalDopRef: formatDop(totalDopRef),
      })
      .catch((e) => console.error("Error enviando correo de proforma:", e));

    revalidatePath("/dashboard");
    revalidatePath("/");

    return { ok: true, registrationId: result.id, code: result.code };
  } catch (error) {
    if (error instanceof CapacityError) {
      return {
        ok: false,
        error:
          "No quedan cupos suficientes para esa fecha. Elige otra fecha o intenta con menos participantes.",
      };
    }
    console.error("Error creando inscripción:", error);
    return {
      ok: false,
      error: "No pudimos completar la inscripción. Intenta de nuevo.",
    };
  }
}
