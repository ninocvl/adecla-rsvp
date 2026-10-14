import Image from "next/image";
import { CONVERSATORIO } from "@/lib/entradas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * El conversatorio con el Ministro de Vivienda. Como el almuerzo y la misión,
 * no pasa por el wizard: la gente ya pagó por fuera y ADECLA solo emite las
 * entradas (con QR) y las envía por correo, así que la tarjeta no tiene un
 * botón de inscripción.
 */
export function ConversatorioCard({ pasado = false }: { pasado?: boolean }) {
  return (
    <Card className="shadow-teal-hover flex h-full flex-col overflow-hidden pt-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <Image
          src={CONVERSATORIO.flyer}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="scale-110 object-cover blur-xl"
        />
        <Image
          src={CONVERSATORIO.flyer}
          alt={`Flyer: Conversatorio ${CONVERSATORIO.titulo}, ${CONVERSATORIO.fecha}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain"
        />
        {pasado ? (
          <Badge className="absolute top-3 right-3 bg-white/90 px-3 py-1 text-sm text-foreground shadow-sm backdrop-blur-sm">
            Así se vivió
          </Badge>
        ) : (
          <Badge className="absolute top-3 left-3 bg-white/90 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm">
            Networking
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="shrink-0 border-r pr-4 text-center">
            <p className="date-block text-3xl font-semibold text-foreground" aria-hidden>
              07
            </p>
            <p
              className="mt-1 text-[0.8rem] font-semibold tracking-widest text-[var(--oro)]"
              aria-hidden
            >
              OCT
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-heading text-xl leading-tight font-medium text-foreground">
              Conversatorio: {CONVERSATORIO.titulo}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {CONVERSATORIO.lugar}
            </p>
            <p className="sr-only">
              {CONVERSATORIO.fecha}, {CONVERSATORIO.horario}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground">
          Un espacio de diálogo con el sector privado, con {CONVERSATORIO.invitado},{" "}
          {CONVERSATORIO.cargo}.
        </p>
        <p className="border-t pt-3 text-sm text-muted-foreground">
          {CONVERSATORIO.horario} · La entrada con QR llega por correo.
        </p>
      </CardContent>
    </Card>
  );
}
