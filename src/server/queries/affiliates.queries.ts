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
      // Existe la fila = esta empresa ya gastó su pareja gratis. Se manda al
      // formulario para no ofrecerle un cupón que el servidor va a rechazar.
      couponRedemption: { select: { id: true } },
    },
  });
  return affiliates.map(({ couponRedemption, ...affiliate }) => ({
    ...affiliate,
    couponUsed: couponRedemption !== null,
  }));
}

export type ActiveAffiliate = Awaited<
  ReturnType<typeof getActiveAffiliates>
>[number];
