import Link from "next/link";
import type { AdminRegistration } from "@/server/queries/admin.queries";
import { formatShortDate, formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusChangeDialog } from "./status-change-dialog";

export function RegistrationTable({
  registrations,
}: {
  registrations: AdminRegistration[];
}) {
  if (registrations.length === 0) {
    return (
      <p className="rounded-lg border bg-white py-12 text-center text-sm text-muted-foreground">
        No hay inscripciones con esos filtros.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>RNC</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Participantes</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.code}</TableCell>
              <TableCell className="max-w-[180px] truncate font-medium">
                {r.company.legalName}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {r.company.rnc}
              </TableCell>
              <TableCell>{r.event.name}</TableCell>
              <TableCell>{formatShortDate(r.eventDate.date)}</TableCell>
              <TableCell>
                <span title={r.participants.map((p) => p.fullName).join(", ")}>
                  {r.quantity}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatUsd(r.totalUsd.toString())}
              </TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/admin/inscripciones/${r.id}`} />}
                  >
                    Ver
                  </Button>
                  <StatusChangeDialog
                    registrationId={r.id}
                    code={r.code}
                    currentStatus={r.status}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a
                        href={`/api/proformas/${r.id}/pdf`}
                        target="_blank"
                        rel="noopener"
                      />
                    }
                  >
                    Proforma
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
