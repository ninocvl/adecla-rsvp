import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRegistrationDetail } from "@/server/queries/registrations.queries";
import { AFFILIATION_LABELS, STATUS_LABELS } from "@/lib/constants";
import {
  formatDop,
  formatEventDate,
  formatIssuedDate,
  formatUsd,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Detalle de inscripción | ADECLA",
};

export default async function InscripcionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    redirect("/login");
  }

  const { id } = await params;
  const registration = await getRegistrationDetail(id, {
    companyId: session.user.companyId,
  });
  if (!registration) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Mis inscripciones
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            Inscripción{" "}
            <span className="font-mono">{registration.code}</span>
          </h1>
        </div>
        <StatusBadge status={registration.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="font-medium">{registration.event.name}</p>
          <p className="text-lg font-semibold">
            {formatEventDate(registration.eventDate.date)}
          </p>
          <p className="text-sm text-muted-foreground">
            {registration.eventDate.label} · {registration.eventDate.venue}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {registration.participants.map((p) => (
              <li key={p.id} className="text-sm">
                <p className="font-medium">
                  {p.position}. {p.fullName}
                </p>
                {(p.email || p.phone) && (
                  <p className="text-muted-foreground">
                    {[p.email, p.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {registration.participants.length === 1 && (
            <p className="mt-4 text-sm text-muted-foreground">
              El torneo se juega por parejas. Escríbenos para completar tu
              pareja cuando tengas al segundo jugador.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de afiliación</span>
            <span className="font-medium">
              {AFFILIATION_LABELS[registration.affiliation]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio unitario</span>
            <span className="font-medium">
              {formatUsd(registration.unitPriceUsd.toString())}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cantidad</span>
            <span className="font-medium">{registration.quantity}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Total</span>
            <span className="text-xl font-semibold">
              {formatUsd(registration.totalUsd.toString())}
            </span>
          </div>
          <p className="text-right text-muted-foreground">
            ≈ {formatDop(registration.totalDopRef.toString())} (1 USD = RD$
            {Number(registration.exchangeRate).toFixed(0)})
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {registration.history.map((h) => (
              <li key={h.id} className="flex justify-between gap-3">
                <span>
                  {h.fromStatus
                    ? `${STATUS_LABELS[h.fromStatus]} → ${STATUS_LABELS[h.toStatus]}`
                    : STATUS_LABELS[h.toStatus]}
                  {h.note && (
                    <span className="text-muted-foreground"> — {h.note}</span>
                  )}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {formatIssuedDate(h.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          nativeButton={false}
          render={
            <a
              href={`/api/proformas/${registration.id}/pdf`}
              target="_blank"
              rel="noopener"
            />
          }
        >
          Descargar proforma
        </Button>
      </div>
    </div>
  );
}
