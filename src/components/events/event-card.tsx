import Image from "next/image";
import Link from "next/link";
import type { LandingCard } from "@/server/queries/events.queries";
import { AFFILIATION_LABELS, PADEL_PRICE_USD } from "@/lib/constants";
import { PADEL_CATEGORIES_POSTER } from "@/lib/event-media";
import { formatDateParts, formatEventDate, formatUsd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { EventRecapGallery } from "./event-recap-gallery";

// Agrupa las categorías que comparten el mismo precio (ej. Constructor y
// Desarrollador a USD 250) para no repetir el monto — nunca un precio único.
function groupPriceTiers(tiers: LandingCard["priceTiers"]) {
  const byAmount = new Map<number, string[]>();
  for (const tier of tiers) {
    const labels = byAmount.get(tier.amountUsd) ?? [];
    labels.push(AFFILIATION_LABELS[tier.affiliation]);
    byAmount.set(tier.amountUsd, labels);
  }
  return [...byAmount.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([amountUsd, labels]) => ({ amountUsd, labels }));
}

export function EventCard({ card }: { card: LandingCard }) {
  const isDate = card.kind === "date";
  const full = isDate && (card.available ?? 0) <= 0;
  const priceGroups = groupPriceTiers(card.priceTiers);
  const recapPhotos = card.recapPhotos ?? [];
  const isRecap = isDate && card.isPast;
  const isPadel = card.eventSlug === "padel";
  const dateParts = isDate
    ? formatDateParts(card.date as Date)
    : { day: "", month: "" };
  // La URL del detalle usa slug + fecha (YYYY-MM-DD) y no el id de la fila:
  // se lee, y sobrevive a un reseed que cambie los cuid.
  const detalleHref = isDate
    ? `/eventos/${card.eventSlug}/${(card.date as Date).toISOString().slice(0, 10)}`
    : "";

  return (
    <Card className="shadow-teal-hover flex h-full flex-col overflow-hidden pt-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {card.imageUrl ? (
          <>
            {/* Los flyers son verticales (4:5) y la tarjeta es apaisada: con
                object-cover se perdía media pieza. Se muestran completos
                sobre una copia desenfocada de sí mismos, que rellena los
                lados sin agrandar la tarjeta ni inventar un fondo. */}
            <Image
              src={card.imageUrl}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="scale-110 object-cover blur-xl"
              style={{ objectPosition: card.imagePosition }}
            />
            <Image
              src={card.imageUrl}
              alt={
                isDate
                  ? `Flyer: ${card.label}, ${card.eventName}`
                  : `Flyer de ${card.eventName}`
              }
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl" role="presentation">
              {card.eventSlug === "padel" ? "🎾" : "🏆"}
            </span>
          </div>
        )}
        {/* El deporte va arriba a la izquierda, sobre la foto: es lo que
            distingue una parada de otra de un vistazo. */}
        <Badge className="absolute top-3 left-3 bg-white/90 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-foreground uppercase backdrop-blur-sm">
          {isPadel ? "Pádel" : "Golf"}
        </Badge>
        {!isDate && (
          <Badge className="absolute right-3 top-3 bg-white/90 px-3 py-1 text-sm text-foreground shadow-sm backdrop-blur-sm">
            Próximamente
          </Badge>
        )}
        {isRecap && (
          <Badge className="absolute right-3 top-3 bg-white/90 px-3 py-1 text-sm text-foreground shadow-sm backdrop-blur-sm">
            Así se vivió
          </Badge>
        )}
      </div>

      <CardHeader>
        {isDate ? (
          <div className="flex items-start gap-4">
            {/* Bloque de fecha: separado por una línea, no por una caja
                anidada dentro de la tarjeta. */}
            <div className="shrink-0 border-r pr-4 text-center">
              <p
                className="date-block text-3xl font-semibold text-foreground"
                aria-hidden
              >
                {dateParts.day}
              </p>
              <p
                className="mt-1 text-[0.8rem] font-semibold tracking-widest text-[var(--oro)]"
                aria-hidden
              >
                {dateParts.month}
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xl leading-tight font-medium text-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {card.venue}
              </p>
              {/* La fecha completa queda accesible para lectores de
                  pantalla, que no deben leer "5" y "SEP" sueltos. */}
              <span className="sr-only">
                {formatEventDate(card.date as Date)}
              </span>
            </div>
          </div>
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
        {isRecap ? (
          recapPhotos.length > 0 ? (
            <EventRecapGallery photos={recapPhotos} />
          ) : (
            <p className="border-t pt-3 text-sm text-muted-foreground">
              Este torneo ya se jugó. Pronto compartimos cómo fue.
            </p>
          )
        ) : isDate && isPadel ? (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Abierto al público. Los invitados de un patrocinador no
                pagan.
              </p>
              <Badge
                variant={full ? "outline" : "secondary"}
                className="shrink-0"
              >
                {full ? "Sin cupos" : `${card.available} cupos`}
              </Badge>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <dt className="text-muted-foreground">Por participante</dt>
              <dd className="font-semibold tabular-nums">
                {formatUsd(PADEL_PRICE_USD)}
              </dd>
            </div>
            <a
              href={PADEL_CATEGORIES_POSTER}
              target="_blank"
              rel="noopener"
              className="-my-1.5 inline-flex items-center py-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Ver categorías
            </a>
          </div>
        ) : isDate ? (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Tarifa por participante, según tu categoría de membresía
              </p>
              <Badge
                variant={full ? "outline" : "secondary"}
                className="shrink-0"
              >
                {full ? "Sin cupos" : `${card.available} cupos`}
              </Badge>
            </div>
            {priceGroups.length > 0 ? (
              <dl className="space-y-1">
                {priceGroups.map((group) => (
                  <div
                    key={group.amountUsd}
                    className="flex items-baseline justify-between text-sm"
                  >
                    <dt className="text-muted-foreground">
                      {group.labels.join(" / ")}
                    </dt>
                    <dd className="font-semibold tabular-nums">
                      {formatUsd(group.amountUsd)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tarifas por definir
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Fechas, categorías y tarifas se anunciarán pronto.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        {isDate ? (
          <>
            {!isRecap && (
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
            )}
            {/* La página de detalle existe también para una parada ya jugada:
                ahí es donde vive el recuento con sus fotos. */}
            <Button
              className="w-full"
              variant="outline"
              nativeButton={false}
              render={<Link href={detalleHref} />}
            >
              Ver detalles
            </Button>
          </>
        ) : (
          !isRecap && (
            <Button className="w-full" variant="secondary" disabled>
              Aún sin fechas
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
