import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusChangeDialog } from "@/components/admin/status-change-dialog";

export const metadata: Metadata = {
  title: "Detalle de inscripción | Admin ADECLA",
};

export default async function AdminInscripcionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const registration = await getRegistrationDetail(id);
  if (!registration) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/inscripciones"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Inscripciones
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            <span className="font-mono">{registration.code}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={registration.status} />
          <StatusChangeDialog
            registrationId={registration.id}
            code={registration.code}
            currentStatus={registration.status}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Razón social</dt>
              <dd className="font-medium">{registration.company.legalName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">RNC</dt>
              <dd className="font-medium">{registration.company.rnc}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Contacto</dt>
              <dd className="font-medium">
                {registration.company.contactName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Correo</dt>
              <dd className="font-medium">{registration.company.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Teléfono</dt>
              <dd className="font-medium">{registration.company.phone}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evento y participantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{registration.event.name}</p>
            <p className="text-lg font-semibold">
              {formatEventDate(registration.eventDate.date)}
            </p>
            <p className="text-sm text-muted-foreground">
              {registration.eventDate.label} · {registration.eventDate.venue}
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {registration.participants.map((p) => (
              <li key={p.id}>
                <span className="font-medium">
                  {p.position}. {p.fullName}
                </span>
                {(p.email || p.phone) && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {[p.email, p.phone].filter(Boolean).join(" · ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Afiliación</span>
            <span className="font-medium">
              {AFFILIATION_LABELS[registration.affiliation]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {registration.quantity} ×{" "}
              {formatUsd(registration.unitPriceUsd.toString())}
            </span>
            <span className="text-lg font-semibold">
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
                  {h.changedBy && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {h.changedBy.email}
                    </span>
                  )}
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
