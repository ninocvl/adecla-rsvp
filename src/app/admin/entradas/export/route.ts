import {
  ENTRADA_TIPO_LABELS,
  ESTADO_ENTRADA_LABELS,
  estadoEntrada,
  formatearCodigo,
  type EstadoEntrada,
} from "@/lib/entradas";
import { getEntradas } from "@/server/queries/entradas.queries";
import { toCsv } from "@/lib/csv";

const HEADERS = [
  "Código",
  "Titular",
  "Tipo",
  "Correo",
  "Teléfono",
  "Cupos",
  "Ingresados",
  "Estado",
  "Correo enviado",
  "Creada",
];

const ESTADOS = ["sin_usar", "parcial", "completa", "anulada"] as const;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const tipo = params.get("tipo");
  const estado = params.get("estado");

  const entradas = await getEntradas({
    q: params.get("q") ?? undefined,
    tipo: tipo === "AFILIADO" || tipo === "EXTERNO" ? tipo : undefined,
    estado: ESTADOS.includes(estado as EstadoEntrada)
      ? (estado as EstadoEntrada)
      : undefined,
  });

  const rows = entradas.map((e) => [
    formatearCodigo(e.id),
    e.nombreTitular,
    ENTRADA_TIPO_LABELS[e.tipoTitular],
    e.correoDestino,
    e.telefono ?? "",
    e.cupos,
    e.ingresados,
    ESTADO_ENTRADA_LABELS[estadoEntrada(e)],
    e.correoEnviadoAt ? "Sí" : "No",
    e.createdAt.toISOString().slice(0, 10),
  ]);

  // BOM para que Excel abra bien las tildes.
  return new Response("﻿" + toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="entradas-conversatorio.csv"',
    },
  });
}
