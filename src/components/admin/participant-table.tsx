import Link from "next/link";
import type { AdminParticipant } from "@/server/queries/admin.queries";
import { getCategoryLabel } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";

/**
 * Marca cada participante con el tamaño de su inscripción y su lugar dentro
 * de ella. La consulta ya los devuelve ordenados por fecha, código y
 * posición, así que los dos de una pareja llegan siempre pegados: aquí solo
 * hace falta saber cuántos comparten inscripción para pintarlos como bloque.
 */
export function agruparParejas(participants: AdminParticipant[]) {
  const porInscripcion = new Map<string, number>();
  for (const p of participants) {
    porInscripcion.set(
      p.registrationId,
      (porInscripcion.get(p.registrationId) ?? 0) + 1
    );
  }
  return participants.map((p, i) => {
    const total = porInscripcion.get(p.registrationId) ?? 1;
    const anterior = participants[i - 1];
    const siguiente = participants[i + 1];
    return {
      p,
      esPareja: total > 1,
      total,
      primeroDelGrupo: anterior?.registrationId !== p.registrationId,
      ultimoDelGrupo: siguiente?.registrationId !== p.registrationId,
    };
  });
}

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

  const filas = agruparParejas(participants);

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-right">#</TableHead>
            <TableHead>Participante</TableHead>
            <TableHead>Inscripción</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map(({ p, esPareja, total, primeroDelGrupo, ultimoDelGrupo }, i) => {
            const r = p.registration;
            return (
              <TableRow
                key={p.id}
                className={cn(
                  // Los dos de una pareja se leen como un bloque: fondo tenue
                  // y sin línea entre ellos, con una barra a la izquierda que
                  // los abraza. Quien juega solo queda en blanco.
                  esPareja && "bg-secondary/40",
                  esPareja && !ultimoDelGrupo && "border-b-0"
                )}
              >
                <TableCell
                  className={cn(
                    "relative text-right text-xs text-muted-foreground tabular-nums",
                    esPareja &&
                      "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary",
                    esPareja && primeroDelGrupo && "before:top-1.5 before:rounded-t",
                    esPareja && ultimoDelGrupo && "before:bottom-1.5 before:rounded-b"
                  )}
                >
                  {i + 1}
                </TableCell>
                <TableCell className="font-medium">{p.fullName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {primeroDelGrupo ? (
                    <>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          esPareja
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {esPareja ? `Pareja (${total})` : "Individual"}
                      </span>
                      <Link
                        href={`/admin/inscripciones/${r.id}`}
                        className="mt-1 block font-mono text-xs text-primary underline-offset-2 hover:underline"
                      >
                        {r.code}
                      </Link>
                    </>
                  ) : (
                    // La segunda fila no repite el chip ni el código: ya se
                    // ven en la primera del bloque.
                    <span className="text-xs text-muted-foreground">
                      ↳ con {participants[i - 1]?.fullName}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
