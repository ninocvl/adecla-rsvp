import Image from "next/image";
import { ALMUERZO_MIVED } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EventRecapGallery } from "./event-recap-gallery";

/**
 * El almuerzo con el MIVED, ya celebrado.
 *
 * Tiene tarjeta propia y no una fila en Event porque nunca tuvo inscripción
 * por la web: se convocó por invitación, así que no hay cupos, ni precio, ni
 * proforma que mostrar. Lo que queda de él son las fotos.
 */
export function AlmuerzoMivedCard() {
  return (
    <Card className="shadow-teal-hover flex h-full flex-col overflow-hidden pt-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <Image
          src={ALMUERZO_MIVED.cover}
          alt={`${ALMUERZO_MIVED.nombre} en ${ALMUERZO_MIVED.lugar}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-white/90 px-3 py-1 text-sm text-foreground shadow-sm backdrop-blur-sm">
          Así se vivió
        </Badge>
      </div>

      <CardHeader className="space-y-1">
        <p className="text-sm font-semibold text-primary">
          {ALMUERZO_MIVED.fecha}
        </p>
        <p className="font-heading text-xl leading-tight font-medium text-foreground">
          {ALMUERZO_MIVED.nombre}
        </p>
        <p className="text-sm text-muted-foreground">
          Networking · {ALMUERZO_MIVED.lugar}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground">
          {ALMUERZO_MIVED.resumen}
        </p>
        <EventRecapGallery photos={[...ALMUERZO_MIVED.fotos]} />
      </CardContent>
    </Card>
  );
}
