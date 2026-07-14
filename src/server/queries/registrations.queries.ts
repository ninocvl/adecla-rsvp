import { prisma } from "@/lib/prisma";

export async function getRegistrationDetail(id: string) {
  return prisma.registration.findUnique({
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
}

export type RegistrationDetail = NonNullable<
  Awaited<ReturnType<typeof getRegistrationDetail>>
>;
