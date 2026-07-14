import type { Metadata } from "next";
import Link from "next/link";
import { getAdminMetrics } from "@/server/queries/admin.queries";
import { formatEventDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/admin/metric-card";

export const metadata: Metadata = {
  title: "Panel administrativo | ADECLA",
};

export default async function AdminPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Panel administrativo</h1>
          <p className="mt-1 text-muted-foreground">
            Resumen del circuito y estado de las inscripciones.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/empresas" />}
          >
            Ver empresas
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin/inscripciones" />}
          >
            Ver inscripciones
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Eventos publicados" value={metrics.publishedEvents} />
        <MetricCard
          label="Empresas inscritas"
          value={metrics.companies}
          hint="Confirma la afiliación en tu registro de socios"
        />
        <MetricCard
          label="Total inscritos"
          value={metrics.participantsCount}
          hint="Participantes en inscripciones activas"
        />
        <MetricCard
          label="Pendientes"
          value={metrics.pending}
          hint="Proforma, pago o revisión"
        />
        <MetricCard label="Confirmadas" value={metrics.confirmed} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cupos por fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {metrics.dates.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">
                    {formatEventDate(d.date)}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {d.label}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {d.eventName} · {d.venue}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {d.available}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {d.capacity} disponibles
                    </span>
                  </p>
                  <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, (d.reserved / d.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
