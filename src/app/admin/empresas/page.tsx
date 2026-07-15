import type { Metadata } from "next";
import { getAdminCompanies } from "@/server/queries/admin.queries";
import { AFFILIATION_LABELS } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
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

export const metadata: Metadata = {
  title: "Empresas | Admin ADECLA",
};

export default async function AdminEmpresasPage() {
  const companies = await getAdminCompanies();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Empresas</h1>
          <p className="mt-1 text-muted-foreground">
            Empresas que se han inscrito en el sistema. La columna Membresía
            muestra si se vincularon a un miembro conocido del listado (revisa
            nombres repetidos ahí) o si pidieron ser miembros. Confírmalo en tu
            propio registro de membresía antes de aceptar a nadie.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/admin/empresas/export" />}
          >
            Descargar CSV
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/admin/empresas/export?format=xlsx" />}
          >
            Descargar Excel
          </Button>
        </div>
      </div>

      {companies.length === 0 ? (
        <p className="rounded-lg border bg-white py-12 text-center text-sm text-muted-foreground">
          Todavía no se ha inscrito ninguna empresa.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>RNC</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Correo / Teléfono</TableHead>
                <TableHead>Membresía</TableHead>
                <TableHead>Inscripciones</TableHead>
                <TableHead>Desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {c.legalName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.rnc}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {AFFILIATION_LABELS[c.affiliationType]}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.contactName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>{c.email}</div>
                    <div>{c.phone}</div>
                  </TableCell>
                  <TableCell>
                    {c.affiliate ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Membresía activa: {c.affiliate.name}
                      </Badge>
                    ) : c.wantsToAffiliate ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        Quiere ser miembro
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Sin membresía ADECLA
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {c._count.registrations}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatShortDate(c.createdAt)}
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
