import type { Metadata } from "next";
import Link from "next/link";
import {
  ENTRADA_TIPO_LABELS,
  ESTADO_ENTRADA_LABELS,
  estadoEntrada,
  formatearCodigo,
  type EstadoEntrada,
} from "@/lib/entradas";
import { getEntradas } from "@/server/queries/entradas.queries";
import { PrintButton } from "@/components/admin/print-button";

export const metadata: Metadata = { title: "Entradas (imprimible) | Admin ADECLA" };
export const dynamic = "force-dynamic";

const ESTADOS = ["sin_usar", "parcial", "completa", "anulada"] as const;

// Respaldo en papel por si se cae el internet en la puerta: código, titular,
// cupos y una casilla para tachar a mano.
export default async function ImprimirEntradasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; estado?: string }>;
}) {
  const { q, tipo, estado } = await searchParams;
  const entradas = await getEntradas({
    q,
    tipo: tipo === "AFILIADO" || tipo === "EXTERNO" ? tipo : undefined,
    estado: ESTADOS.includes(estado as EstadoEntrada)
      ? (estado as EstadoEntrada)
      : undefined,
  });
  const vigentes = entradas.filter((e) => !e.anulada);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link href="/admin/entradas" className="text-sm text-muted-foreground hover:text-foreground">
            ← Entradas
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Vista imprimible</h1>
        </div>
        <PrintButton />
      </div>

      <div>
        <h2 className="text-lg font-semibold">
          Conversatorio ADECLA · 7 de octubre de 2026 · SBG Blue Mall
        </h2>
        <p className="text-sm text-muted-foreground">
          {vigentes.length} entradas vigentes ·{" "}
          {vigentes.reduce((n, e) => n + e.cupos, 0)} cupos. Las anuladas salen
          tachadas: no dejar pasar.
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 text-left">
            <th className="py-1.5 pr-2">Código</th>
            <th className="py-1.5 pr-2">Titular</th>
            <th className="py-1.5 pr-2">Tipo</th>
            <th className="py-1.5 pr-2 text-center">Cupos</th>
            <th className="py-1.5 pr-2">Estado</th>
            <th className="py-1.5 text-center">Entró</th>
          </tr>
        </thead>
        <tbody>
          {[...entradas]
            .sort((a, b) => a.nombreTitular.localeCompare(b.nombreTitular, "es"))
            .map((e) => (
              <tr key={e.id} className="border-b" style={{ breakInside: "avoid" }}>
                <td className="py-1.5 pr-2 font-mono">{formatearCodigo(e.id)}</td>
                <td className={`py-1.5 pr-2 font-medium ${e.anulada ? "line-through" : ""}`}>
                  {e.nombreTitular}
                </td>
                <td className="py-1.5 pr-2">{ENTRADA_TIPO_LABELS[e.tipoTitular]}</td>
                <td className="py-1.5 pr-2 text-center tabular-nums">{e.cupos}</td>
                <td className="py-1.5 pr-2">{ESTADO_ENTRADA_LABELS[estadoEntrada(e)]}</td>
                <td className="py-1.5 text-center">
                  {Array.from({ length: e.cupos }).map((_, i) => (
                    <span
                      key={i}
                      className="mx-0.5 inline-block size-4 rounded-sm border border-foreground/70 align-middle"
                    />
                  ))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
