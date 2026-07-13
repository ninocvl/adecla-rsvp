import { prisma } from "@/lib/prisma";
import type { RegistrationStatus } from "@/generated/prisma/enums";

const PENDING_STATUSES: RegistrationStatus[] = [
  "PROFORMA_GENERADA",
  "PENDIENTE_PAGO",
  "EN_REVISION",
];

export async function getAdminMetrics() {
  const [publishedEvents, participantsCount, pending, confirmed, dates] =
    await Promise.all([
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.participant.count({
        where: { registration: { status: { not: "CANCELADA" } } },
      }),
      prisma.registration.count({
        where: { status: { in: PENDING_STATUSES } },
      }),
      prisma.registration.count({ where: { status: "CONFIRMADA" } }),
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
  eventId?: string;
}

export async function getAdminRegistrations(
  filters: AdminRegistrationFilters = {}
) {
  return prisma.registration.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.eventId ? { eventId: filters.eventId } : {}),
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

export async function getEventsForFilter() {
  return prisma.event.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
}
