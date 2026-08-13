import { prisma } from "@/lib/prisma";
import type {
  PadelCategory,
  RegistrationStatus,
} from "@/generated/prisma/enums";
import { PADEL_CATEGORIES } from "@/lib/constants";

const PENDING_STATUSES: RegistrationStatus[] = [
  "PROFORMA_GENERADA",
  "PENDIENTE_PAGO",
  "EN_REVISION",
];

export async function getAdminMetrics() {
  const [
    publishedEvents,
    participantsCount,
    pending,
    confirmed,
    companies,
    affiliationRequests,
    dates,
    padelSum,
    padelRegistrants,
  ] = await Promise.all([
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    // Lo archivado no cuenta en ninguna métrica: para el panel es como si
    // no existiera, aunque la fila siga en la base.
    prisma.participant.count({
      where: {
        registration: { status: { not: "CANCELADA" }, archivedAt: null },
      },
    }),
    prisma.registration.count({
      where: { status: { in: PENDING_STATUSES }, archivedAt: null },
    }),
    prisma.registration.count({
      where: { status: "CONFIRMADA", archivedAt: null },
    }),
    prisma.company.count(),
    prisma.company.count({ where: { wantsToAffiliate: true } }),
    prisma.eventDate.findMany({
      where: { isActive: true },
      include: { event: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
    // Total de jugadores que van a pádel: suma de quantity, no cantidad de
    // inscripciones (cada una puede traer 1 o 2 jugadores).
    prisma.registration.aggregate({
      where: {
        event: { slug: "padel" },
        status: { not: "CANCELADA" },
        archivedAt: null,
      },
      _sum: { quantity: true },
    }),
    // Empresas/personas distintas inscritas en pádel: una misma empresa
    // (mismo RNC) que se inscribe más de una vez no debe contarse dos veces.
    prisma.registration.findMany({
      where: {
        event: { slug: "padel" },
        status: { not: "CANCELADA" },
        archivedAt: null,
      },
      select: { companyId: true },
      distinct: ["companyId"],
    }),
  ]);

  return {
    publishedEvents,
    participantsCount,
    pending,
    confirmed,
    companies,
    affiliationRequests,
    padelParticipants: padelSum._sum.quantity ?? 0,
    padelCompanies: padelRegistrants.length,
    dates: dates.map((d) => ({
      id: d.id,
      eventName: d.event.name,
      date: d.date,
      label: d.label,
      venue: d.venue,
      capacity: d.capacity,
      reserved: d.reservedCount,
      available: Math.max(0, d.capacity - d.reservedCount),
    })),
  };
}

export interface AdminRegistrationFilters {
  status?: RegistrationStatus;
  eventDateId?: string;
  /** Por defecto el panel solo muestra las vigentes. */
  archivadas?: boolean;
}

export async function getAdminRegistrations(
  filters: AdminRegistrationFilters = {}
) {
  return prisma.registration.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.eventDateId ? { eventDateId: filters.eventDateId } : {}),
      // Archivar saca la inscripción del panel sin borrarla: solo aparece
      // cuando se pide expresamente el archivo.
      archivedAt: filters.archivadas ? { not: null } : null,
    },
    include: {
      company: { select: { legalName: true, rnc: true, email: true } },
      event: { select: { name: true } },
      eventDate: { select: { date: true, label: true } },
      participants: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type AdminRegistration = Awaited<
  ReturnType<typeof getAdminRegistrations>
>[number];

// Filtro por fecha (parada) específica, no solo por evento: un evento como
// "Torneo de Golf ADECLA 2026" puede tener varias paradas, y el admin
// necesita distinguir entre ellas, no solo entre golf/pádel.
export async function getEventDatesForFilter() {
  const dates = await prisma.eventDate.findMany({
    where: { isActive: true },
    include: { event: { select: { name: true } } },
    orderBy: [{ event: { createdAt: "asc" } }, { date: "asc" }],
  });
  return dates.map((d) => ({
    id: d.id,
    label: `${d.event.name} · ${d.label}`,
  }));
}

// Lista de empresas registradas para que el admin vea quién quiere afiliarse
// y lo gestione en su propio Excel/sistema de afiliados — el sistema aquí
// solo da visibilidad, no un flujo de aprobación.
export async function getAdminCompanies() {
  return prisma.company.findMany({
    include: {
      _count: { select: { registrations: true } },
      affiliate: { select: { name: true, sourceId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type AdminCompany = Awaited<ReturnType<typeof getAdminCompanies>>[number];

export interface AdminParticipantFilters {
  status?: RegistrationStatus;
  eventDateId?: string;
  archivadas?: boolean;
  padelCategory?: PadelCategory;
  /** El género sale del prefijo de la categoría, no hay campo aparte. */
  genero?: "FEMENINO" | "MASCULINO";
}

/**
 * Una fila por participante (no por inscripción): es la lista que se usa para
 * armar los grupos del torneo y para pasarle los nombres al club, donde una
 * inscripción de dos jugadores tiene que aparecer como dos personas.
 */
export async function getAdminParticipants(
  filters: AdminParticipantFilters = {}
) {
  return prisma.participant.findMany({
    where: {
      registration: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.eventDateId ? { eventDateId: filters.eventDateId } : {}),
        ...(filters.padelCategory
          ? { padelCategory: filters.padelCategory }
          : filters.genero
            ? {
                padelCategory: {
                  in: PADEL_CATEGORIES.filter((c) =>
                    c.startsWith(filters.genero!)
                  ),
                },
              }
            : {}),
        archivedAt: filters.archivadas ? { not: null } : null,
      },
    },
    include: {
      registration: {
        include: {
          company: { select: { legalName: true, rnc: true, email: true, phone: true } },
          event: { select: { name: true } },
          eventDate: { select: { date: true, label: true, venue: true } },
        },
      },
    },
    orderBy: [
      { registration: { eventDate: { date: "asc" } } },
      { registration: { code: "asc" } },
      { position: "asc" },
    ],
  });
}

export type AdminParticipant = Awaited<
  ReturnType<typeof getAdminParticipants>
>[number];

/**
 * Cupones de pareja gratis con su empresa afiliada y, si ya se canjeó, la
 * inscripción donde se usó. Ordena primero los disponibles: es la lista que
 * ADECLA usa para repartirlos.
 */
/**
 * El cupón es uno solo para todas (CUPON_PAREJA_GRATIS), así que la lista
 * útil es la de afiliadas: quién ya lo canjeó y quién todavía lo tiene
 * disponible. Se listan todas, no solo las que lo usaron, porque la pregunta
 * del panel suele ser "¿esta empresa ya lo gastó?".
 */
export async function getAdminCoupons() {
  const afiliadas = await prisma.affiliate.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      contactName: true,
      phone: true,
      couponRedemption: {
        select: {
          createdAt: true,
          registration: {
            select: { code: true, company: { select: { legalName: true } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  const canjeados = afiliadas.filter((a) => a.couponRedemption).length;
  return { afiliadas, canjeados, disponibles: afiliadas.length - canjeados };
}

export type AdminCouponRow = Awaited<
  ReturnType<typeof getAdminCoupons>
>["afiliadas"][number];
