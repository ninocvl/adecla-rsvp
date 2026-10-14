import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { puedeEditar } from "@/lib/permissions";
import {
  ENTRADA_TIPO_LABELS,
  ESTADO_ENTRADA_LABELS,
  estadoEntrada,
  formatearCodigo,
  type EstadoEntrada,
} from "@/lib/entradas";
import {
  getEntradas,
  getTotalesEntradas,
} from "@/server/queries/entradas.queries";
import { EntradaAcciones } from "@/components/admin/entrada-acciones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Entradas | Admin ADECLA" };
export const dynamic = "force-dynamic";

const ESTADOS = ["sin_usar", "parcial", "completa", "anulada"] as const;

function hora(d: Date) {
  return d.toLocaleString("es-DO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Santo_Domingo",
  });
}

export default async function AdminEntradasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; estado?: string }>;
}) {
  const { q, tipo, estado } = await searchParams;
  const tipoOk = tipo === "AFILIADO" || tipo === "EXTERNO" ? tipo : undefined;
  const estadoOk = ESTADOS.includes(estado as EstadoEntrada)
    ? (estado as EstadoEntrada)
    : undefined;

  const [session, entradas, totales] = await Promise.all([
    auth(),
    getEntradas({ q, tipo: tipoOk, estado: estadoOk }),
    getTotalesEntradas(),
  ]);
  const editor = puedeEditar(session?.user?.role);

  const exportQs = new URLSearchParams();
  if (q) exportQs.set("q", q);
  if (tipoOk) exportQs.set("tipo", tipoOk);
  if (estadoOk) exportQs.set("estado", estadoOk);
  const qs = exportQs.toString() ? `?${exportQs.toString()}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Entradas</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Conversatorio del 7 de octubre. Las entradas se emiten, se envían
            por correo y se validan en la puerta con el QR.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editor && (
            <Button nativeButton={false} render={<Link href="/admin/entradas/nueva" />}>
              Nueva entrada
            </Button>
          )}
          <Button variant="outline" nativeButton={false} render={<Link href="/checkin" />}>
            Abrir check-in
          </Button>
          <Button variant="outline" nativeButton={false} render={<a href={`/admin/entradas/export${qs}`} />}>
            Descargar CSV
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href={`/admin/entradas/imprimir${qs}`} />}>
            Vista imprimible
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Total label="Entradas" value={totales.entradas} hint={totales.anuladas ? `${totales.anuladas} anuladas aparte` : "Vigentes"} />
        <Total label="Cupos emitidos" value={totales.cuposEmitidos} hint="Personas con derecho a entrar" />
        <Total label="Personas adentro" value={totales.personasDentro} hint="Ingresos marcados" />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-muted-foreground">Buscar</span>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Nombre, código o correo"
            className="h-9 w-full min-w-[200px] rounded-lg border bg-transparent px-3"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Titular</span>
          <select name="tipo" defaultValue={tipoOk ?? ""} className="h-9 rounded-lg border bg-transparent px-2">
            <option value="">Todos</option>
            <option value="AFILIADO">Afiliado</option>
            <option value="EXTERNO">Externo</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Estado</span>
          <select name="estado" defaultValue={estadoOk ?? ""} className="h-9 rounded-lg border bg-transparent px-2">
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_ENTRADA_LABELS[e]}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
        {(q || tipoOk || estadoOk) && (
          <Link href="/admin/entradas" className="pb-2 text-sm text-primary underline underline-offset-4">
            Quitar filtros
          </Link>
        )}
      </form>

      {entradas.length === 0 ? (
        <p className="rounded-lg border bg-white py-12 text-center text-sm text-muted-foreground">
          No hay entradas con esos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Cupos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradas.map((e) => {
                const estadoE = estadoEntrada(e);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-sm">{formatearCodigo(e.id)}</TableCell>
                    <TableCell className="max-w-[260px]">
                      <span className="block font-medium">{e.nombreTitular}</span>
                      <span className="text-xs text-muted-foreground">
                        {ENTRADA_TIPO_LABELS[e.tipoTitular]} · {e.correoDestino}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {e.ingresados} / {e.cupos}
                      {e.ingresos[0] && (
                        <span className="block text-xs text-muted-foreground">
                          último {hora(e.ingresos[0].createdAt)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={estadoE === "anulada" ? "outline" : "secondary"}>
                        {ESTADO_ENTRADA_LABELS[estadoE]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {e.correoEnviadoAt ? (
                        <span className="text-muted-foreground">Enviado {hora(e.correoEnviadoAt)}</span>
                      ) : (
                        <span className="font-medium text-destructive">No enviado</span>
                      )}
                      {e.correoError && !e.correoEnviadoAt && (
                        <span className="block max-w-[200px] text-muted-foreground">{e.correoError}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EntradaAcciones id={e.id} anulada={e.anulada} puedeEditar={editor} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Total({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="min-w-[190px] flex-1 rounded-lg border bg-white p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
