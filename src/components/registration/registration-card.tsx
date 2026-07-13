import Link from "next/link";
import type { CompanyRegistration } from "@/server/queries/registrations.queries";
import { formatDop, formatEventDate, formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

export function RegistrationCard({
  registration,
}: {
  registration: CompanyRegistration;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {registration.code}
          </p>
          <p className="font-semibold">{registration.event.name}</p>
        </div>
        <StatusBadge status={registration.status} />
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Fecha: </span>
          <span className="font-medium">
            {formatEventDate(registration.eventDate.date)}
          </span>{" "}
          <span className="text-muted-foreground">
            · {registration.eventDate.venue}
          </span>
        </p>
        <p>
          <span className="text-muted-foreground">Participantes: </span>
          {registration.participants.map((p) => p.fullName).join(", ")}
        </p>
        <p>
          <span className="text-muted-foreground">Monto: </span>
          <span className="font-medium">
            {formatUsd(registration.totalUsd.toString())}
          </span>{" "}
          <span className="text-muted-foreground">
            (≈ {formatDop(registration.totalDopRef.toString())})
          </span>
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/inscripciones/${registration.id}`} />}
        >
          Ver detalles
        </Button>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <a
              href={`/api/proformas/${registration.id}/pdf`}
              target="_blank"
              rel="noopener"
            />
          }
        >
          Descargar proforma
        </Button>
      </CardFooter>
    </Card>
  );
}
