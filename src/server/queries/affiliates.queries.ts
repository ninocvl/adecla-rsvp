import { prisma } from "@/lib/prisma";

export async function getActiveAffiliates() {
  const affiliates = await prisma.affiliate.findMany({
    where: { status: "ACTIVO" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      affiliationType: true,
      contactName: true,
      phone: true,
      email: true,
    },
  });
  return affiliates;
}

export type ActiveAffiliate = Awaited<
  ReturnType<typeof getActiveAffiliates>
>[number];
