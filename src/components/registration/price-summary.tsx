import { NOTA_PAGO } from "@/lib/constants";
import { formatDop, formatUsd } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PriceSummaryProps {
  eventName?: string;
  dateText?: string;
  venue?: string;
  affiliationLabel?: string;
  unitPriceUsd: number | null;
  quantity: number;
  rate: number;
}

export function PriceSummary({
  eventName,
  dateText,
  venue,
  affiliationLabel,
  unitPriceUsd,
  quantity,
  rate,
}: PriceSummaryProps) {
  const totalUsd = unitPriceUsd !== null ? unitPriceUsd * quantity : null;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">Tu inscripción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <dl className="space-y-2">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Evento</dt>
            <dd className="text-right font-medium">{eventName ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="text-right font-medium">{dateText ?? "—"}</dd>
          </div>
          {venue && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Sede</dt>
              <dd className="text-right">{venue}</dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Afiliación</dt>
            <dd className="text-right font-medium">{affiliationLabel ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Participantes</dt>
            <dd className="text-right font-medium">{quantity}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Precio unitario</dt>
            <dd className="text-right font-medium tabular-nums">
              {unitPriceUsd !== null ? formatUsd(unitPriceUsd) : "—"}
            </dd>
          </div>
        </dl>
        <Separator />
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">Total</span>
          <span className="text-xl font-semibold tabular-nums">
            {totalUsd !== null ? formatUsd(totalUsd) : "—"}
          </span>
        </div>
        {totalUsd !== null && (
          <p className="text-right text-muted-foreground tabular-nums">
            ≈ {formatDop(totalUsd * rate)}{" "}
            <span className="text-xs">(1 USD = RD${rate.toFixed(0)})</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">{NOTA_PAGO}</p>
      </CardContent>
    </Card>
  );
}
