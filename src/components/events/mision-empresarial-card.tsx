import Image from "next/image";
import Link from "next/link";
import { EXPOCAMACOL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const MISION_DETALLE_HREF = "/eventos/mision-empresarial";

// Misma anatomía que EventCard (foto, chip de categoría, bloque de fecha,
// contenido, pie) para que entre en la grilla sin desentonar. No reusa
// EventCard porque esa recibe un LandingCard de la base, y la misión no vive
// ahí: se inscribe por un formulario aparte, no por el wizard.
export function MisionEmpresarialCard() {
  return (
    <Card className="shadow-teal-hover flex flex-col overflow-hidden pt-0">
      <div className="relative aspect-[16/10] bg-secondary">
        <Image
          src={EXPOCAMACOL.flyer}
          alt={`Flyer: ${EXPOCAMACOL.nombre}, ${EXPOCAMACOL.fechas}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          style={{ objectPosition: "top" }}
        />
        <Badge className="absolute top-3 left-3 bg-white/90 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm">
          Networking
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="shrink-0 border-r pr-4 text-center">
            <p
              className="date-block text-3xl font-semibold text-foreground"
              aria-hidden
            >
              {EXPOCAMACOL.diaCorto}
            </p>
            <p
              className="mt-1 text-[0.8rem] font-semibold tracking-widest text-[var(--oro)]"
              aria-hidden
            >
              {EXPOCAMACOL.mesCorto}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-heading text-xl leading-tight font-medium text-foreground">
              Misión Empresarial
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {EXPOCAMACOL.lugar}
            </p>
            <p className="sr-only">{EXPOCAMACOL.fechas} de 2026</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          Delegación de ADECLA a {EXPOCAMACOL.feria}. Vuelo, hospedaje y
          traslados coordinados.
        </p>
        <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
          La inscripción se llena en un formulario aparte.
        </p>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          nativeButton={false}
          render={
            <a href={EXPOCAMACOL.formUrl} target="_blank" rel="noopener" />
          }
        >
          Reservar mi cupo
        </Button>
        <Button
          className="w-full"
          variant="outline"
          nativeButton={false}
          render={<Link href={MISION_DETALLE_HREF} />}
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
