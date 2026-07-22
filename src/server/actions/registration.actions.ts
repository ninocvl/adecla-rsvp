"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/server/services/email";
import { renderProformaPdf } from "@/lib/pdf/render-proforma-pdf";
import type { ProformaSnapshot } from "@/lib/pdf/proforma-types";
import {
  createRegistrationSchema,
  normalizeRnc,
  type CreateRegistrationInput,
} from "@/lib/validations/registration.schema";
import { AFFILIATION_LABELS, ITBIS_RATE } from "@/lib/constants";
import { formatDop, formatEventDate, formatUsd } from "@/lib/format";

export type CreateRegistrationResult =
  | { ok: true; registrations: { registrationId: string; code: string }[] }
  | { ok: false; error: string };

class CapacityError extends Error {}

export async function createRegistrationAction(
  input: CreateRegistrationInput
): Promise<CreateRegistrationResult> {
  const parsed = createRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const data = parsed.data;
  const quantity = data.participants.length;
  const rnc = normalizeRnc(data.rnc);
  const email = data.email.toLowerCase();

  // Nunca se confía en el nombre/tipo que mande el cliente para el vínculo de
  // afiliado: se relee el registro real del listado de socios. Para una
  // empresa afiliada conocida, su tipo de afiliación real (no el que mandó el
  // formulario) es el que fija la tarifa.
  const affiliate =
    data.isAffiliated && data.affiliateId
      ? await prisma.affiliate.findUnique({ where: { id: data.affiliateId } })
      : null;
  if (data.isAffiliated && !affiliate) {
    return { ok: false, error: "Selecciona tu empresa de la lista." };
  }
  const affiliationType = affiliate?.affiliationType ?? data.affiliationType;

  const [event, eventDates, price, rateSetting] = await Promise.all([
    prisma.event.findUnique({ where: { id: data.eventId } }),
    prisma.eventDate.findMany({ where: { id: { in: data.eventDateIds } } }),
    prisma.eventPrice.findUnique({
      where: {
        eventId_affiliation: { eventId: data.eventId, affiliation: affiliationType },
      },
    }),
    prisma.setting.findUnique({ where: { key: "usd_to_dop_rate" } }),
  ]);

  if (!event || event.status !== "PUBLISHED") {
    return { ok: false, error: "Este evento no está disponible." };
  }
  if (
    eventDates.length !== data.eventDateIds.length ||
    eventDates.some((d) => d.eventId !== event.id || !d.isActive)
  ) {
    return { ok: false, error: "Alguna de esas fechas no está disponible." };
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
  // Subtotal (precio de tarifa) + 18% de ITBIS = total real a pagar.
  const subtotalUsd = unitPriceUsd * quantity;
  const itbisUsd = subtotalUsd * ITBIS_RATE;
  const totalUsd = subtotalUsd + itbisUsd;
  const totalDopRef = totalUsd * exchangeRate;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Sin cuenta de por medio, la misma empresa puede volver a rellenar el
      // formulario para inscribirse en otra fecha: se reconoce por RNC y se
      // actualiza en vez de bloquear con "ya existe una empresa con ese RNC".
      const company = await tx.company.upsert({
        where: { rnc },
        create: {
          legalName: data.legalName,
          rnc,
          contactName: data.contactName,
          email,
          phone: data.phone,
          affiliationType,
          affiliateId: affiliate?.id,
          wantsToAffiliate: !data.isAffiliated && data.wantsToAffiliate,
        },
        update: {
          legalName: data.legalName,
          contactName: data.contactName,
          email,
          phone: data.phone,
          affiliationType,
          affiliateId: affiliate?.id,
          wantsToAffiliate: !data.isAffiliated && data.wantsToAffiliate,
        },
      });

      // Los mismos participantes se inscriben en cada fecha elegida: una
      // registración independiente por fecha, todas o ninguna en esta misma
      // transacción, para no dejar cupos tomados a medias.
      const registrations: {
        registrationId: string;
        code: string;
        snapshot: ProformaSnapshot;
      }[] = [];
      for (const eventDate of eventDates) {
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
            affiliation: affiliationType,
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
        const snapshot: ProformaSnapshot = {
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
          affiliation: affiliationType,
          affiliationLabel: AFFILIATION_LABELS[affiliationType],
          quantity,
          unitPriceUsd: unitPriceUsd.toFixed(2),
          subtotalUsd: subtotalUsd.toFixed(2),
          itbisUsd: itbisUsd.toFixed(2),
          totalUsd: totalUsd.toFixed(2),
          exchangeRate: exchangeRate.toFixed(2),
          totalDopRef: totalDopRef.toFixed(2),
          participants: data.participants.map((p, index) => ({
            fullName: p.fullName,
            position: index + 1,
          })),
        };

        await tx.proforma.create({
          data: {
            registrationId: registration.id,
            number: code,
            snapshot: snapshot as unknown as Prisma.InputJsonValue,
          },
        });

        registrations.push({ registrationId: registration.id, code, snapshot });
      }

      return { registrations, company };
    });

    // El correo (con el PDF de cada proforma adjunto) nunca bloquea la
    // inscripción: se genera y se envía sin esperar su resultado.
    Promise.all(
      result.registrations.map(async (r) => ({
        filename: `proforma-${r.code}.pdf`,
        content: await renderProformaPdf(r.snapshot),
      }))
    )
      .then((attachments) =>
        emailService.sendProformaCreated({
          to: result.company.email,
          companyName: result.company.legalName,
          contactName: result.company.contactName,
          registrationCode: result.registrations.map((r) => r.code).join(", "),
          eventName: event.name,
          eventDate: eventDates.map((d) => formatEventDate(d.date)).join(" y "),
          totalUsd: formatUsd(totalUsd * eventDates.length),
          totalDopRef: formatDop(totalDopRef * eventDates.length),
          attachments,
        })
      )
      .catch((e) => console.error("Error enviando correo de proforma:", e));

    revalidatePath("/");

    return {
      ok: true,
      registrations: result.registrations.map((r) => ({
        registrationId: r.registrationId,
        code: r.code,
      })),
    };
  } catch (error) {
    if (error instanceof CapacityError) {
      return {
        ok: false,
        error:
          "No quedan cupos suficientes para una de esas fechas. Elige otra fecha o intenta con menos participantes.",
      };
    }
    console.error("Error creando inscripción:", error);
    return {
      ok: false,
      error: "No pudimos completar la inscripción. Intenta de nuevo.",
    };
  }
}
