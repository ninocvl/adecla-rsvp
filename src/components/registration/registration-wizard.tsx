"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createRegistrationAction } from "@/server/actions/registration.actions";
import type { WizardEvent } from "@/server/queries/events.queries";
import { AFFILIATION_LABELS } from "@/lib/constants";
import { formatEventDate, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stepper } from "./stepper";
import { PriceSummary } from "./price-summary";
import { ParticipantForm, type ParticipantValue } from "./participant-form";

export interface WizardCompany {
  legalName: string;
  rnc: string;
  contactName: string;
  email: string;
  phone: string;
}

interface RegistrationWizardProps {
  events: WizardEvent[];
  company: WizardCompany;
  rate: number;
  initialEventSlug?: string;
}

type Affiliation = "CONSTRUCTOR" | "PROVEEDOR" | "DESARROLLADOR";

export function RegistrationWizard({
  events,
  company,
  rate,
  initialEventSlug,
}: RegistrationWizardProps) {
  const initialEvent =
    events.find((e) => e.slug === initialEventSlug) ??
    (events.length === 1 ? events[0] : undefined);

  const [step, setStep] = useState(0);
  const [eventId, setEventId] = useState<string | undefined>(initialEvent?.id);
  const [eventDateId, setEventDateId] = useState<string>();
  const [affiliation, setAffiliation] = useState<Affiliation>();
  const [participants, setParticipants] = useState<ParticipantValue[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; code: string }>();
  const [isPending, startTransition] = useTransition();

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId]
  );
  const eventDate = event?.dates.find((d) => d.id === eventDateId);
  const price = event?.prices.find((p) => p.affiliation === affiliation);
  const unitPriceUsd =
    price?.isEnabled && price.amountUsd !== null ? price.amountUsd : null;

  const step1Ready =
    !!event && !!eventDate && !!affiliation && unitPriceUsd !== null;

  function submit() {
    if (!event || !eventDate || !affiliation) return;
    setServerError(null);
    startTransition(async () => {
      const response = await createRegistrationAction({
        eventId: event.id,
        eventDateId: eventDate.id,
        affiliation,
        participants,
      });
      if (response.ok) {
        setResult({ id: response.registrationId, code: response.code });
        setStep(4);
      } else {
        setServerError(response.error);
      }
    });
  }

  return (
    <div className="space-y-8">
      <Stepper current={step} />

      <div
        className={cn(
          "grid gap-6",
          step < 4 && "lg:grid-cols-[1fr_320px]"
        )}
      >
        <div className="space-y-6">
          {step === 0 && (
            <section className="space-y-6">
              <div className="space-y-3">
                <h2 className="font-medium">Evento</h2>
                <div
                  role="radiogroup"
                  aria-label="Evento"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {events.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      role="radio"
                      aria-checked={eventId === e.id}
                      onClick={() => {
                        setEventId(e.id);
                        setEventDateId(undefined);
                      }}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors",
                        eventId === e.id
                          ? "border-primary bg-accent"
                          : "hover:border-primary/40"
                      )}
                    >
                      <p className="font-medium">{e.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {e.dates.length} fecha{e.dates.length === 1 ? "" : "s"}{" "}
                        disponible{e.dates.length === 1 ? "" : "s"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {event && (
                <div className="space-y-3">
                  <h2 className="font-medium">Fecha</h2>
                  <div role="radiogroup" aria-label="Fecha" className="grid gap-3">
                    {event.dates.map((d) => {
                      const full = d.available <= 0;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          role="radio"
                          aria-checked={eventDateId === d.id}
                          disabled={full}
                          onClick={() => setEventDateId(d.id)}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors",
                            eventDateId === d.id
                              ? "border-primary bg-accent"
                              : "hover:border-primary/40",
                            full && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <span>
                            <span className="block font-medium">
                              {formatEventDate(d.date)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {d.label} · {d.venue}
                            </span>
                          </span>
                          <Badge variant={full ? "outline" : "secondary"}>
                            {full ? "Sin cupos" : `${d.available} cupos`}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {event && (
                <div className="space-y-3">
                  <h2 className="font-medium">Tipo de afiliación</h2>
                  <div
                    role="radiogroup"
                    aria-label="Tipo de afiliación"
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    {event.prices.map((p) => {
                      const enabled = p.isEnabled && p.amountUsd !== null;
                      return (
                        <button
                          key={p.affiliation}
                          type="button"
                          role="radio"
                          aria-checked={affiliation === p.affiliation}
                          disabled={!enabled}
                          onClick={() => setAffiliation(p.affiliation)}
                          className={cn(
                            "rounded-lg border p-4 text-left transition-colors",
                            affiliation === p.affiliation
                              ? "border-primary bg-accent"
                              : "hover:border-primary/40",
                            !enabled && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <p className="font-medium">
                            {AFFILIATION_LABELS[p.affiliation]}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {enabled
                              ? `${formatUsd(p.amountUsd as number)} por participante`
                              : "Próximamente"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button disabled={!step1Ready} onClick={() => setStep(1)}>
                  Continuar
                </Button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Razón social
                      </dt>
                      <dd className="font-medium">{company.legalName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">RNC</dt>
                      <dd className="font-medium">{company.rnc}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Contacto
                      </dt>
                      <dd className="font-medium">{company.contactName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Correo</dt>
                      <dd className="font-medium">{company.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Teléfono
                      </dt>
                      <dd className="font-medium">{company.phone}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm text-muted-foreground">
                    La proforma se emitirá con estos datos y se enviará a este
                    correo.
                  </p>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Atrás
                </Button>
                <Button onClick={() => setStep(2)}>Continuar</Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <ParticipantForm
              defaultValues={participants}
              onBack={() => setStep(1)}
              onNext={(p) => {
                setParticipants(p);
                setStep(3);
              }}
            />
          )}

          {step === 3 && event && eventDate && affiliation && (
            <section className="space-y-6">
              {serverError && (
                <Alert variant="destructive" role="alert">
                  {serverError}
                </Alert>
              )}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Evento</p>
                    <p className="font-medium">{event.name}</p>
                  </div>
                  <div className="rounded-lg bg-accent p-4">
                    <p className="text-sm text-accent-foreground">
                      Fecha del evento
                    </p>
                    <p className="text-lg font-semibold">
                      {formatEventDate(eventDate.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {eventDate.label} · {eventDate.venue}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Participantes
                    </p>
                    <ul className="mt-1 space-y-1">
                      {participants.map((p, i) => (
                        <li key={i} className="font-medium">
                          {i + 1}. {p.fullName}
                        </li>
                      ))}
                    </ul>
                    {participants.length === 1 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Podrás completar tu pareja más adelante.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button onClick={submit} disabled={isPending}>
                  {isPending ? "Generando…" : "Generar inscripción"}
                </Button>
              </div>
            </section>
          )}

          {step === 4 && result && (
            <section className="mx-auto max-w-xl space-y-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <svg
                  viewBox="0 0 24 24"
                  className="size-7 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="M4 12.5 9.5 18 20 6.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">
                  Inscripción generada
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Tu código de inscripción es{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {result.code}
                  </span>
                  . La proforma quedó generada, pendiente de pago, y la
                  enviaremos al correo registrado de tu empresa.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={`/api/proformas/${result.id}/pdf`}
                      target="_blank"
                      rel="noopener"
                    />
                  }
                >
                  Descargar proforma
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard" />}
                >
                  Ir a mi panel
                </Button>
              </div>
            </section>
          )}
        </div>

        {step < 4 && (
          <PriceSummary
            eventName={event?.name}
            dateText={eventDate ? formatEventDate(eventDate.date) : undefined}
            venue={eventDate?.venue}
            affiliationLabel={
              affiliation ? AFFILIATION_LABELS[affiliation] : undefined
            }
            unitPriceUsd={unitPriceUsd}
            quantity={Math.max(1, participants.length)}
            rate={rate}
          />
        )}
      </div>
    </div>
  );
}
