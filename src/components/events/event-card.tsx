import Image from "next/image";
import Link from "next/link";
import type { LandingCard } from "@/server/queries/events.queries";
import { AFFILIATION_LABELS } from "@/lib/constants";
import { formatEventDate, formatUsd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

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

  return (
    <Card className="shadow-teal-hover flex flex-col overflow-hidden pt-0">
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
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Tarifa por participante, según tu categoría de afiliación
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
