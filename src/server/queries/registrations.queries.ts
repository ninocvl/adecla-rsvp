import { prisma } from "@/lib/prisma";

export async function getCompanyRegistrations(companyId: string) {
  return prisma.registration.findMany({
    where: { companyId },
    include: {
      event: { select: { name: true, slug: true } },
      eventDate: { select: { date: true, label: true, venue: true } },
      participants: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type CompanyRegistration = Awaited<
  ReturnType<typeof getCompanyRegistrations>
>[number];

interface DetailAccess {
  companyId?: string;
  isAdmin?: boolean;
}

export async function getRegistrationDetail(
  id: string,
  access: DetailAccess
) {
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      company: true,
      event: { select: { name: true, slug: true } },
      eventDate: { select: { date: true, label: true, venue: true } },
      participants: { orderBy: { position: "asc" } },
      proforma: { select: { id: true, number: true, issuedAt: true } },
      history: {
        include: { changedBy: { select: { email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!registration) return null;
  if (!access.isAdmin && registration.companyId !== access.companyId) {
    return null;
  }
  return registration;
}

export type RegistrationDetail = NonNullable<
  Awaited<ReturnType<typeof getRegistrationDetail>>
>;
