import { prisma } from "@/lib/prisma";

/**
 * Lo que de verdad toca la base en la puerta, separado de la autenticación
 * para poder probarlo sin sesión (ver las acciones en checkin.actions.ts,
 * que son las únicas que lo llaman).
 */

/**
 * Marca el ingreso de `cantidad` personas. El descuento es UN solo UPDATE
 * condicional: si dos celulares escanean a la vez, la base serializa las dos
 * sentencias y la segunda solo pasa si todavía quedan cupos.
 * Devuelve false si no había cupos suficientes, la entrada está anulada o no
 * existe.
 */
export async function marcarIngreso(
  id: string,
  cantidad: number,
  staff: string
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const afectadas = await tx.$executeRaw`
      UPDATE "Entrada"
      SET "ingresados" = "ingresados" + ${cantidad}
      WHERE "id" = ${id}
        AND "anulada" = false
        AND "ingresados" + ${cantidad} <= "cupos"
    `;
    if (afectadas !== 1) return false;
    await tx.entradaIngreso.create({
      data: { entradaId: id, cantidad, staff },
    });
    return true;
  });
}

/** Deshace el último ingreso que no se haya deshecho ya. */
export async function deshacerUltimoIngreso(id: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const ultimo = await tx.entradaIngreso.findFirst({
      where: { entradaId: id, revertidoAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!ultimo) return false;

    // Marcar primero: si otro celular deshizo el mismo ingreso un instante
    // antes, count será 0 y no se resta dos veces.
    const marcado = await tx.entradaIngreso.updateMany({
      where: { id: ultimo.id, revertidoAt: null },
      data: { revertidoAt: new Date() },
    });
    if (marcado.count === 0) return false;

    await tx.$executeRaw`
      UPDATE "Entrada"
      SET "ingresados" = "ingresados" - ${ultimo.cantidad}
      WHERE "id" = ${id} AND "ingresados" - ${ultimo.cantidad} >= 0
    `;
    return true;
  });
}
