import Image from "next/image";
import Link from "next/link";
import type { LandingCard } from "@/server/queries/events.queries";
import { AFFILIATION_LABELS } from "@/lib/constants";
import { formatEventDate, formatUsd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function dayAndMonth(date: Date) {
  const day = new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
  const month = new Intl.DateTimeFormat("es-DO", {
    month: "short",
    timeZone: "UTC",
  }).format(date);
  return { day, month: month.replace(".", "").toUpperCase() };
}

export function EventCard({ card }: { card: LandingCard }) {
  const isDate = card.kind === "date";
  const full = isDate && (card.available ?? 0) <= 0;
  const priceGroups = groupPriceTiers(card.priceTiers);

  if (!isDate) {
    return (
      <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-carbon bg-carbon text-white">
        <div className="relative aspect-[16/10] overflow-hidden">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={`Flyer de ${card.eventName}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="module-hover-img object-cover object-top opacity-75"
            />
          ) : (
            <div className="geo-grid-bg--on-carbon absolute inset-0" aria-hidden />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent"
            aria-hidden
          />
          <span
            className="absolute -bottom-3 left-3 select-none font-heading text-7xl font-bold text-white/10"
            aria-hidden
          >
            26
          </span>
          <span className="absolute right-3 top-4 origin-top-right -rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Próximamente
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="font-heading text-lg font-semibold text-white">
            {card.eventName}
          </p>
          {card.description && (
            <p className="line-clamp-2 text-sm text-white/70">
              {card.description}
            </p>
          )}
          <p className="mt-auto text-sm text-white/60">
            Fechas, categorías y tarifas se anunciarán pronto.
          </p>
          <Button
            className="w-full border border-white/25 bg-transparent text-white hover:bg-white/10"
            variant="outline"
            disabled
          >
            Aún sin fechas
          </Button>
        </div>
      </div>
    );
  }

  const { day, month } = dayAndMonth(card.date as Date);

  return (
    <div className="module-hover group relative flex h-full flex-col">
      {/* Módulo de imagen */}
      <div className="relative">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg border-2 border-carbon bg-secondary">
          <Image
            src={card.imageUrl ?? ""}
            alt={`Flyer: ${card.label}, ${card.eventName}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="module-hover-img object-cover object-top"
          />
        </div>
        <Badge
          variant={full ? "outline" : "secondary"}
          className="absolute right-3 top-3 shadow-sm"
        >
          {full ? "Sin cupos" : `${card.available} cupos`}
        </Badge>
        {/* Módulo de fecha: sobresale del contenedor de la imagen. */}
        <div className="module-shadow absolute -bottom-5 left-4 flex items-baseline gap-1.5 rounded-md bg-carbon px-3.5 py-2 text-white">
          <span className="font-heading text-2xl leading-none font-bold tabular-nums">
            {day}
          </span>
          <span className="text-[10px] font-semibold tracking-[0.14em] text-white/70">
            {month}
          </span>
        </div>
      </div>

      {/* Módulo de información */}
      <div className="mt-8 px-1">
        <p className="font-heading text-lg font-semibold leading-tight text-foreground">
          {card.label}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {card.eventName} · {card.venue}
        </p>
      </div>

      {/* Módulo de tarifas */}
      <div className="relative mt-4 rounded-lg border border-border bg-white p-4">
        <div
          className="absolute -right-1.5 -top-1.5 h-3 w-3 border border-brand-teal/50"
          aria-hidden
        />
        <p className="text-xs text-muted-foreground">
          Tarifa por participante, según tu categoría de afiliación
        </p>
        {priceGroups.length > 0 ? (
          <dl className="mt-2 space-y-1">
            {priceGroups.map((group) => (
              <div
                key={group.amountUsd}
                className="flex items-baseline justify-between text-sm"
              >
                <dt className="text-muted-foreground">
                  {group.labels.join(" / ")}
                </dt>
                <dd className="font-heading font-semibold tabular-nums">
                  {formatUsd(group.amountUsd)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Tarifas por definir
          </p>
        )}
      </div>

      {/* Módulo de acción */}
      <Button
        className="mt-4 w-full"
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
      <span className="sr-only">
        {formatEventDate(card.date as Date)}
      </span>
    </div>
  );
}
