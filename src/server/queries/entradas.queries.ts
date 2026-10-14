import { prisma } from "@/lib/prisma";
import { estadoEntrada, type EstadoEntrada } from "@/lib/entradas";
import type { Prisma } from "@/generated/prisma/client";

export async function getEntrada(id: string) {
  return prisma.entrada.findUnique({
    where: { id },
    include: {
      evento: { select: { name: true } },
      ingresos: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type EntradaDetalle = NonNullable<Awaited<ReturnType<typeof getEntrada>>>;

export interface FiltrosEntradas {
  q?: string;
  tipo?: "AFILIADO" | "EXTERNO";
  estado?: EstadoEntrada;
}

export async function getEntradas(filtros: FiltrosEntradas = {}) {
  const where: Prisma.EntradaWhereInput = {};
  if (filtros.tipo) where.tipoTitular = filtros.tipo;
  const q = filtros.q?.trim();
  if (q) {
    const codigo = q.toUpperCase().replace(/[^A-Z0-9]/g, "");
    where.OR = [
      { nombreTitular: { contains: q, mode: "insensitive" } },
      { correoDestino: { contains: q, mode: "insensitive" } },
      ...(codigo ? [{ id: { contains: codigo } }] : []),
    ];
  }

  const todas = await prisma.entrada.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { ingresos: { orderBy: { createdAt: "desc" }, take: 1, where: { revertidoAt: null } } },
  });

  // El estado se deriva de cupos/ingresados/anulada: filtrarlo aquí en vez
  // de duplicar la regla en SQL. Son cientos de filas, no millones.
  return filtros.estado
    ? todas.filter((e) => estadoEntrada(e) === filtros.estado)
    : todas;
}

export type EntradaFila = Awaited<ReturnType<typeof getEntradas>>[number];

export async function getTotalesEntradas() {
  const [filas, dentro] = await Promise.all([
    prisma.entrada.findMany({
      select: { anulada: true, cupos: true, ingresados: true },
    }),
    prisma.entrada.aggregate({
      where: { anulada: false },
      _sum: { ingresados: true },
    }),
  ]);
  const vigentes = filas.filter((f) => !f.anulada);
  return {
    entradas: vigentes.length,
    anuladas: filas.length - vigentes.length,
    cuposEmitidos: vigentes.reduce((n, f) => n + f.cupos, 0),
    personasDentro: dentro._sum.ingresados ?? 0,
  };
}

export async function getEventoConversatorio() {
  return prisma.event.findUnique({ where: { slug: "conversatorio" } });
}
