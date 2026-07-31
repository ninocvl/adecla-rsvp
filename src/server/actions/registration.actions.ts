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
import { findMatchingSponsor } from "@/lib/sponsors";
import type { PadelCategory, PadelClub } from "@/generated/prisma/enums";
import {
  getCategoryLabel,
  isItbisExempt,
  ITBIS_RATE,
  PADEL_CLUB_DISCOUNT_RATE,
  PADEL_PRICE_USD,
} from "@/lib/constants";
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

  const [event, eventDates, rateSetting] = await Promise.all([
    prisma.event.findUnique({ where: { id: data.eventId } }),
    prisma.eventDate.findMany({ where: { id: { in: data.eventDateIds } } }),
    prisma.setting.findUnique({ where: { key: "usd_to_dop_rate" } }),
  ]);

  if (!event || event.status !== "PUBLISHED") {
    return { ok: false, error: "Este evento no está disponible." };
  }
  // El eventSlug del cliente solo decide qué preguntas mostrar en el
  // formulario; la ramificación real (precio, proforma, patrocinador) usa
  // siempre event.slug recién leído de la base, nunca lo que mandó el cliente.
  const isPadel = event.slug === "padel";

  if (
    eventDates.length !== data.eventDateIds.length ||
    eventDates.some((d) => d.eventId !== event.id || !d.isActive)
  ) {
    return { ok: false, error: "Alguna de esas fechas no está disponible." };
  }
  if (quantity > event.playersPerTeam) {
    return {
      ok: false,
      error: `Este evento admite máximo ${event.playersPerTeam} participantes por inscripción.`,
    };
  }

  // --- Pádel: categoría + situación (afiliado / patrocinador / club /
  // público). Sin EventPrice: tarifas planas o con descuento en código. ---
  let padelCategory: PadelCategory | undefined;
  let padelClub: PadelClub | undefined;
  let isSponsorGuest = false;
  let sponsorName: string | undefined;
  let sponsorRnc: string | undefined;
  let sponsorRncVerified = false;
  // Vínculo a un afiliado real conocido, solo para Company (nunca se guarda
  // en Registration.affiliation — eso es exclusivo de golf).
  let companyAffiliateId: string | undefined;
  let companyAffiliationType:
    | "CONSTRUCTOR"
    | "PROVEEDOR"
    | "DESARROLLADOR"
    | undefined;

  // --- Golf: afiliación + tarifa por EventPrice ---
  let affiliationType: "CONSTRUCTOR" | "PROVEEDOR" | "DESARROLLADOR" | undefined;
  let affiliateId: string | undefined;

  let unitPriceUsd: number;

  if (isPadel) {
    if (!data.padelCategory) {
      return { ok: false, error: "Selecciona tu categoría." };
    }
    padelCategory = data.padelCategory;

    const participantType = data.padelParticipantType;
    if (!participantType) {
      return { ok: false, error: "Indica tu situación para la inscripción." };
    }

    if (participantType === "PATROCINADOR") {
      if (!data.sponsorName || !data.sponsorRnc) {
        return {
          ok: false,
          error: "Indica el nombre y el RNC del patrocinador.",
        };
      }
      isSponsorGuest = true;
      sponsorName = data.sponsorName;
      sponsorRnc = normalizeRnc(data.sponsorRnc);
      sponsorRncVerified = !!findMatchingSponsor(data.sponsorRnc);
      unitPriceUsd = 0;
    } else if (participantType === "CLUB") {
      if (!data.padelClub) {
        return { ok: false, error: "Selecciona tu club." };
      }
      padelClub = data.padelClub;
      unitPriceUsd = PADEL_PRICE_USD * (1 - PADEL_CLUB_DISCOUNT_RATE);
    } else if (participantType === "AFILIADO") {
      // Igual que en golf: nunca se confía en lo que mande el cliente para
      // el vínculo de afiliado, se relee el registro real del listado.
      const affiliate = data.affiliateId
        ? await prisma.affiliate.findUnique({ where: { id: data.affiliateId } })
        : null;
      if (!affiliate) {
        return { ok: false, error: "Selecciona tu empresa de la lista." };
      }
      companyAffiliateId = affiliate.id;
      companyAffiliationType = affiliate.affiliationType ?? undefined;
      unitPriceUsd = PADEL_PRICE_USD;
    } else {
      // PUBLICO: abierto a cualquiera, tarifa plana sin descuentos.
      unitPriceUsd = PADEL_PRICE_USD;
    }
  } else {
    // Nunca se confía en el nombre/tipo que mande el cliente para el vínculo
    // de afiliado: se relee el registro real del listado de socios. Para una
    // empresa afiliada conocida, su tipo de afiliación real (no el que mandó
    // el formulario) es el que fija la tarifa.
    const affiliate =
      data.isAffiliated && data.affiliateId
        ? await prisma.affiliate.findUnique({ where: { id: data.affiliateId } })
        : null;
    if (data.isAffiliated && !affiliate) {
      return { ok: false, error: "Selecciona tu empresa de la lista." };
    }
    affiliationType = affiliate?.affiliationType ?? data.affiliationType;
    affiliateId = affiliate?.id;
    if (!affiliationType) {
      return { ok: false, error: "Selecciona el tipo de empresa." };
    }
    const price = await prisma.eventPrice.findUnique({
      where: {
        eventId_affiliation: { eventId: event.id, affiliation: affiliationType },
      },
    });
    if (!price || !price.isEnabled || price.amountUsd === null) {
      return {
        ok: false,
        error:
          "Tu categoría de membresía todavía no tiene tarifa para este evento.",
      };
    }
    unitPriceUsd = Number(price.amountUsd);
  }

  const exchangeRate = Number(rateSetting?.value ?? "60");
  // Subtotal (precio de tarifa) + ITBIS = total real a pagar. El ITBIS
  // depende de la fecha exacta (isItbisExempt), así que se calcula dentro
  // del bucle por fecha, no aquí una sola vez: una inscripción con varias
  // fechas de golf podría mezclar una exenta con una que no lo es. Un
  // invitado de patrocinador paga 0 de cualquier forma, ITBIS incluido —
  // no se le genera proforma más abajo.
  const subtotalUsd = unitPriceUsd * quantity;
  const categoryLabel = getCategoryLabel(affiliationType, padelCategory, padelClub);
  const registrationStatus = isSponsorGuest
    ? sponsorRncVerified
      ? "CONFIRMADA"
      : "EN_REVISION"
    : "PROFORMA_GENERADA";

  // El vínculo de afiliado en Company puede venir del flujo de golf o del
  // flujo de pádel "Soy afiliado de ADECLA" — cualquiera de los dos alimenta
  // el mismo campo, nunca los dos a la vez porque el evento es uno solo.
  const finalAffiliateId = affiliateId ?? companyAffiliateId;
  const finalCompanyAffiliationType = affiliationType ?? companyAffiliationType;

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
          affiliationType: finalCompanyAffiliationType,
          affiliateId: finalAffiliateId,
          wantsToAffiliate: !isPadel && !data.isAffiliated && !!data.wantsToAffiliate,
        },
        update: {
          legalName: data.legalName,
          contactName: data.contactName,
          email,
          phone: data.phone,
          ...(finalCompanyAffiliationType
            ? { affiliationType: finalCompanyAffiliationType }
            : {}),
          ...(finalAffiliateId ? { affiliateId: finalAffiliateId } : {}),
          wantsToAffiliate: !isPadel && !data.isAffiliated && !!data.wantsToAffiliate,
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
        const itbisUsd = isItbisExempt(event.slug, eventDate.date)
          ? 0
          : subtotalUsd * ITBIS_RATE;
        const totalUsd = subtotalUsd + itbisUsd;
        const totalDopRef = totalUsd * exchangeRate;

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
            padelCategory,
            padelClub,
            isSponsorGuest,
            sponsorName,
            sponsorRnc,
            sponsorRncVerified,
            status: registrationStatus,
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
              create: { fromStatus: null, toStatus: registrationStatus },
            },
          },
        });

        // Snapshot autocontenido: la proforma imprime siempre estos datos,
        // aunque después cambien precios, tasa o datos de la empresa. Un
        // invitado de patrocinador no llega aquí con proforma real (ver más
        // abajo), pero igual arma el snapshot por si se necesita después.
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
          affiliation: affiliationType ?? padelCategory ?? "",
          affiliationLabel: categoryLabel,
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

        // Un invitado de patrocinador no paga: no se le genera proforma ni
        // se le envía correo de cobro, tal como pidió ADECLA.
        if (!isSponsorGuest) {
          await tx.proforma.create({
            data: {
              registrationId: registration.id,
              number: code,
              snapshot: snapshot as unknown as Prisma.InputJsonValue,
            },
          });
        }

        registrations.push({ registrationId: registration.id, code, snapshot });
      }

      return { registrations, company };
    });

    // El correo (con el PDF de cada proforma adjunto) nunca bloquea la
    // inscripción: se genera y se envía sin esperar su resultado. No aplica
    // para invitados de patrocinador, que no tienen proforma que cobrar.
    if (!isSponsorGuest) {
      // Cada fecha puede tener su propio total (una está exenta de ITBIS y
      // otra no), así que el total del correo se suma desde los snapshots
      // reales en vez de asumir el mismo monto multiplicado por la cantidad
      // de fechas.
      const emailTotalUsd = result.registrations.reduce(
        (sum, r) => sum + Number(r.snapshot.totalUsd),
        0
      );
      const emailTotalDopRef = result.registrations.reduce(
        (sum, r) => sum + Number(r.snapshot.totalDopRef),
        0
      );
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
            totalUsd: formatUsd(emailTotalUsd),
            totalDopRef: formatDop(emailTotalDopRef),
            attachments,
          })
        )
        .catch((e) => console.error("Error enviando correo de proforma:", e));
    }

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
