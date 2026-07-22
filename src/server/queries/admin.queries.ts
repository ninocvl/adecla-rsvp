import { prisma } from "@/lib/prisma";
import type { RegistrationStatus } from "@/generated/prisma/enums";

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
  ] = await Promise.all([
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.participant.count({
      where: { registration: { status: { not: "CANCELADA" } } },
    }),
    prisma.registration.count({
      where: { status: { in: PENDING_STATUSES } },
    }),
    prisma.registration.count({ where: { status: "CONFIRMADA" } }),
    prisma.company.count(),
    prisma.company.count({ where: { wantsToAffiliate: true } }),
    prisma.eventDate.findMany({
      where: { isActive: true },
      include: { event: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
  ]);

  return {
    publishedEvents,
    participantsCount,
    pending,
    confirmed,
    companies,
    affiliationRequests,
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
}

export async function getAdminRegistrations(
  filters: AdminRegistrationFilters = {}
) {
  return prisma.registration.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.eventDateId ? { eventDateId: filters.eventDateId } : {}),
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
