import Link from "next/link";
import type { AdminParticipant } from "@/server/queries/admin.queries";
import { getCategoryLabel } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";

export function ParticipantTable({
  participants,
}: {
  participants: AdminParticipant[];
}) {
  if (participants.length === 0) {
    return (
      <p className="rounded-lg border bg-white py-12 text-center text-sm text-muted-foreground">
        No hay participantes con esos filtros.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-right">#</TableHead>
            <TableHead>Participante</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Inscripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p, i) => {
            const r = p.registration;
            return (
              <TableRow key={p.id}>
                <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                  {i + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {p.fullName}
                  {/* Jugador 2 de una pareja: se marca para que al armar los
                      grupos se vea de un vistazo quién viene con quién. */}
                  {p.position > 1 && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (acompañante)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {/* El participante puede no traer sus propios datos: en ese
                      caso el contacto válido es el de la empresa. */}
                  {p.email || p.phone ? (
                    <>
                      {p.email && <span className="block">{p.email}</span>}
                      {p.phone && <span className="block">{p.phone}</span>}
                    </>
                  ) : (
                    <span className="block">{r.company.email}</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[170px] truncate">
                  {r.company.legalName}
                  <span className="block text-xs text-muted-foreground">
                    {r.company.rnc}
                  </span>
                </TableCell>
                <TableCell className="max-w-[150px] truncate text-sm">
                  {r.event.name}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatShortDate(r.eventDate.date)}
                  <span className="block text-xs text-muted-foreground">
                    {r.eventDate.label}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {getCategoryLabel(r.affiliation, r.padelCategory, r.padelClub)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/inscripciones/${r.id}`}
                    className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                  >
                    {r.code}
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
