import type { Metadata } from "next";
import { getAdminCoupons } from "@/server/queries/admin.queries";
import { CUPON_PAREJA_GRATIS } from "@/lib/coupons";
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

export const metadata: Metadata = {
  title: "Cupones | Admin ADECLA",
};

export const dynamic = "force-dynamic";

export default async function AdminCuponesPage() {
  const { afiliadas, canjeados, disponibles } = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cupón de pareja gratis</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Es el mismo código para todas las afiliadas, y cada empresa lo
            puede usar una sola vez. Cubre al acompañante en el torneo de
            pádel, así que aplica cuando la empresa inscribe dos jugadores.
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
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-muted-foreground">
          Este es el código que se le comparte a las empresas afiliadas
        </p>
        <p className="mt-2 font-mono text-3xl font-semibold tracking-wide">
          {CUPON_PAREJA_GRATIS}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Se escribe en el formulario de inscripción, en el paso de la empresa.
          No importa si lo escriben en minúscula o sin el ADECLA.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Total
          label="Todavía lo tienen"
          value={disponibles}
          hint="Empresas que no lo han usado"
        />
        <Total
          label="Ya lo usaron"
          value={canjeados}
          hint="No lo pueden repetir"
        />
        <Total
          label="Empresas afiliadas"
          value={afiliadas.length}
          hint="Total del listado de socios"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa afiliada</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usado en</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {afiliadas.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="max-w-[280px] font-medium">
                  {a.name}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {a.email && <span className="block">{a.email}</span>}
                  {a.phone && <span className="block">{a.phone}</span>}
                  {!a.email && !a.phone && "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={a.couponRedemption ? "outline" : "secondary"}>
                    {a.couponRedemption ? "Ya lo usó" : "Disponible"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {a.couponRedemption ? (
                    <>
                      <span className="font-mono text-xs">
                        {a.couponRedemption.registration.code}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatShortDate(a.couponRedemption.createdAt)}
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
