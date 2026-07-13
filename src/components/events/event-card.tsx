import Image from "next/image";
import Link from "next/link";
import type { LandingCard } from "@/server/queries/events.queries";
import { formatEventDate, formatUsd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function EventCard({ card }: { card: LandingCard }) {
  const isDate = card.kind === "date";
  const full = isDate && (card.available ?? 0) <= 0;

  return (
    <Card className="flex flex-col overflow-hidden pt-0 transition-shadow duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] bg-secondary">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={
              isDate
                ? `Flyer: ${card.label}, ${card.eventName}`
                : `Flyer de ${card.eventName}`
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl" role="presentation">
              {card.eventSlug === "padel" ? "🎾" : "🏆"}
            </span>
          </div>
        )}
        {!isDate && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <Badge className="bg-muted px-3 py-1 text-sm text-foreground">
              Próximamente
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        {isDate ? (
          <>
            <p className="text-sm font-semibold text-primary">
              {formatEventDate(card.date as Date)}
            </p>
            <p className="font-heading text-xl font-medium leading-tight text-foreground">
              {card.label}
            </p>
            <p className="text-sm text-muted-foreground">
              {card.eventName} · {card.venue}
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-xl font-medium text-foreground">
              {card.eventName}
            </p>
            {card.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {card.description}
              </p>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {isDate ? (
          <div className="flex items-end justify-between border-t pt-3">
            <div>
              <p className="text-xs text-muted-foreground">Desde</p>
              <p className="text-xl font-semibold tabular-nums">
                {card.minPriceUsd !== null
                  ? formatUsd(card.minPriceUsd)
                  : "Por definir"}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  / participante
                </span>
              </p>
            </div>
            <Badge variant={full ? "outline" : "secondary"}>
              {full ? "Sin cupos" : `${card.available} cupos disponibles`}
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fechas, categorías y tarifas se anunciarán pronto.
          </p>
        )}
      </CardContent>

      <CardFooter>
        {isDate ? (
          <Button
            className="w-full"
            disabled={full}
            nativeButton={false}
            render={
              <Link
                href={`/inscripciones/nueva?evento=${card.eventSlug}&fecha=${card.id}`}
              />
            }
          >
            {full ? "Sin cupos disponibles" : "Inscribirme"}
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
