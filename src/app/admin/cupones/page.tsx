import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAdminCoupons } from "@/server/queries/admin.queries";
import { puedeEditar } from "@/lib/permissions";
import { formatShortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenerarCuponesButton } from "@/components/admin/generar-cupones-button";

export const metadata: Metadata = {
  title: "Cupones | Admin ADECLA",
};

export const dynamic = "force-dynamic";

export default async function AdminCuponesPage() {
  const [session, { cupones, afiliadosSinCupon }] = await Promise.all([
    auth(),
    getAdminCoupons(),
  ]);
  const editable = puedeEditar(session?.user?.role);

  const usados = cupones.filter((c) => c.usedAt).length;
  const disponibles = cupones.length - usados;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cupones de pareja gratis</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Uno por empresa afiliada, de un solo uso. Cubre al acompañante en
            el torneo de pádel, así que aplica cuando la empresa inscribe dos
            jugadores.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/admin/cupones/export" />}
          >
            Descargar CSV
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/admin/cupones/export?format=xlsx" />}
          >
            Descargar Excel
          </Button>
          {editable && afiliadosSinCupon > 0 && (
            <GenerarCuponesButton pendientes={afiliadosSinCupon} />
          )}
        </div>
      </div>

      {!editable && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm text-muted-foreground">
          Tu cuenta es de solo lectura: puedes consultar y descargar los
          cupones, pero no generarlos.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <Total label="Sin usar" value={disponibles} hint="Listos para canjear" />
        <Total label="Ya canjeados" value={usados} hint="No se pueden repetir" />
        <Total
          label="Afiliadas sin cupón"
          value={afiliadosSinCupon}
          hint={
            afiliadosSinCupon > 0
              ? "Genera los que faltan"
              : "Todas tienen el suyo"
          }
        />
      </div>

      {cupones.length === 0 ? (
        <p className="rounded-lg border bg-white py-12 text-center text-sm text-muted-foreground">
          Todavía no hay cupones generados.
          {editable && " Usa el botón de arriba para crearlos."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa afiliada</TableHead>
                <TableHead>Cupón</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usado en</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cupones.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-[260px] font-medium">
                    {c.affiliate.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.affiliate.email && (
                      <span className="block">{c.affiliate.email}</span>
                    )}
                    {c.affiliate.phone && (
                      <span className="block">{c.affiliate.phone}</span>
                    )}
                    {!c.affiliate.email && !c.affiliate.phone && "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.usedAt ? "outline" : "secondary"}>
                      {c.usedAt ? "Canjeado" : "Sin usar"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.usedAt ? (
                      <>
                        <span className="font-mono text-xs">
                          {c.usedByRegistration?.code ?? "—"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {formatShortDate(c.usedAt)}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Total({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="min-w-[190px] flex-1 rounded-lg border bg-white p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
