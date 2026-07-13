import Image from "next/image";
import Link from "next/link";
import type { LandingEvent } from "@/server/queries/events.queries";
import { formatEventDate, formatUsd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EventCard({ event }: { event: LandingEvent }) {
  const isPublished = event.status === "PUBLISHED";

  return (
    <Card className="flex flex-col overflow-hidden pt-0 transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/10] bg-secondary">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={`Flyer de ${event.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl" role="presentation">
              {event.slug === "padel" ? "🎾" : "🏆"}
            </span>
          </div>
        )}
        {!isPublished && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <Badge className="bg-gold text-gold-foreground px-3 py-1 text-sm">
              Próximamente
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{event.name}</CardTitle>
        {event.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {isPublished ? (
          <>
            <ul className="space-y-1.5 text-sm">
              {event.dates.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{formatEventDate(d.date)}</span>
                  <span className="text-muted-foreground">{d.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-end justify-between border-t pt-3">
              <div>
                <p className="text-xs text-muted-foreground">Desde</p>
                <p className="text-xl font-semibold">
                  {event.minPriceUsd !== null
                    ? formatUsd(event.minPriceUsd)
                    : "Por definir"}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / participante
                  </span>
                </p>
              </div>
              <Badge variant="secondary">
                {event.totalAvailable} cupos disponibles
              </Badge>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fechas, categorías y tarifas se anunciarán pronto.
          </p>
        )}
      </CardContent>

      <CardFooter>
        {isPublished ? (
          <Button
            className="w-full"
            nativeButton={false} render={<Link href={`/inscripciones/nueva?evento=${event.slug}`} />}
          >
            Inscribirme
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            Aún sin fechas
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
