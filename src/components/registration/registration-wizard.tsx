"use client";

import { useMemo, useState, useTransition } from "react";
import { createRegistrationAction } from "@/server/actions/registration.actions";
import type { CompanyStepInput } from "@/lib/validations/registration.schema";
import type { WizardEvent } from "@/server/queries/events.queries";
import type { ActiveAffiliate } from "@/server/queries/affiliates.queries";
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
import { CompanyStep } from "./company-step";
import { ParticipantForm, type ParticipantValue } from "./participant-form";

interface RegistrationWizardProps {
  events: WizardEvent[];
  affiliates: ActiveAffiliate[];
  rate: number;
  initialEventSlug?: string;
  initialEventDateId?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-muted-foreground">{children}</p>
  );
}

export function RegistrationWizard({
  events,
  affiliates,
  rate,
  initialEventSlug,
  initialEventDateId,
}: RegistrationWizardProps) {
  const initialEvent =
    events.find((e) => e.slug === initialEventSlug) ??
    (events.length === 1 ? events[0] : undefined);

  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<CompanyStepInput>();
  const [eventId, setEventId] = useState<string | undefined>(initialEvent?.id);
  const [eventDateId, setEventDateId] = useState<string | undefined>(
    initialEventDateId
  );
  const [participants, setParticipants] = useState<ParticipantValue[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; code: string }>();
  const [isPending, startTransition] = useTransition();

  const affiliation = company?.affiliationType;

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId]
  );
  const eventDate = event?.dates.find((d) => d.id === eventDateId);
  const price = event?.prices.find((p) => p.affiliation === affiliation);
  const unitPriceUsd =
    price?.isEnabled && price.amountUsd !== null ? price.amountUsd : null;
  const priceUnavailable = !!event && !!affiliation && unitPriceUsd === null;

  // eventDate ya queda undefined por sí solo si eventDateId no pertenece al
  // evento seleccionado (event.dates.find no encuentra coincidencia), así que
  // no hace falta un efecto para "limpiar" el estado.
  const step1Ready = !!event && !!eventDate && unitPriceUsd !== null;

  function submit() {
    if (!company || !event || !eventDate) return;
    setServerError(null);
    startTransition(async () => {
      const response = await createRegistrationAction({
        ...company,
        eventId: event.id,
        eventDateId: eventDate.id,
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
            <CompanyStep
              affiliates={affiliates}
              defaultValues={company}
              onNext={(data) => {
                setCompany(data);
                setStep(1);
              }}
            />
          )}

          {step === 1 && company && (
            <section className="space-y-6">
              <div className="space-y-3">
                <SectionLabel>Evento</SectionLabel>
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
                      onClick={() => setEventId(e.id)}
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
                  <SectionLabel>Fecha</SectionLabel>
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
                <div className="rounded-lg border bg-muted/40 p-4">
                  <SectionLabel>Tu tarifa</SectionLabel>
                  {priceUnavailable ? (
                    <p className="mt-1 text-sm text-destructive">
                      Tu categoría de afiliación (
                      {AFFILIATION_LABELS[company.affiliationType]}) todavía no tiene
                      tarifa para este evento. Escríbenos si crees que esto es
                      un error.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm">
                      Como empresa{" "}
                      <span className="font-medium">
                        {AFFILIATION_LABELS[company.affiliationType]}
                      </span>
                      , tu tarifa es{" "}
                      <span className="font-medium">
                        {formatUsd(unitPriceUsd as number)}
                      </span>{" "}
                      por participante.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Atrás
                </Button>
                <Button disabled={!step1Ready} onClick={() => setStep(2)}>
                  Continuar
                </Button>
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

          {step === 3 && company && event && eventDate && (
            <section className="space-y-6">
              {serverError && (
                <Alert variant="destructive" role="alert">
                  {serverError}
                </Alert>
              )}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{company.legalName}</p>
                    <p className="text-sm text-muted-foreground">
                      RNC {company.rnc} ·{" "}
                      {AFFILIATION_LABELS[company.affiliationType]}
                    </p>
                  </div>
                  <Separator />
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
                  <p className="text-sm text-muted-foreground">
                    La proforma se emitirá con estos datos y se enviará al
                    correo de la empresa.
                  </p>
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
                  <span className="font-mono font-semibold tabular-nums text-foreground">
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
              </div>
            </section>
          )}
        </div>

        {step > 0 && step < 4 && (
          <PriceSummary
            eventName={event?.name}
            dateText={eventDate ? formatEventDate(eventDate.date) : undefined}
            venue={eventDate?.venue}
            affiliationLabel={affiliation ? AFFILIATION_LABELS[affiliation] : undefined}
            unitPriceUsd={unitPriceUsd}
            quantity={Math.max(1, participants.length)}
            rate={rate}
          />
        )}
      </div>
    </div>
  );
}
