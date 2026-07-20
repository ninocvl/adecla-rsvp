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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [eventDateIds, setEventDateIds] = useState<string[]>(
    initialEventDateId ? [initialEventDateId] : []
  );
  // Por defecto la selección de fecha es única (como un radio): así nunca
  // hay un estado bloqueado a medio camino. Activar este modo es lo que
  // habilita elegir varias fechas a la vez, y ya funciona como la
  // confirmación de "los mismos participantes en todas".
  const [multiDateMode, setMultiDateMode] = useState(false);
  const [participantCount, setParticipantCount] = useState<1 | 2 | undefined>(
    undefined
  );
  const [participants, setParticipants] = useState<ParticipantValue[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] =
    useState<{ registrationId: string; code: string }[]>();
  // Fechas ya inscritas en esta sesión (posiblemente en envíos encadenados),
  // para poder ofrecer solo las que faltan al terminar cada envío.
  const [registeredDateIds, setRegisteredDateIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const affiliation = company?.affiliationType;

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId]
  );
  const selectedDates = useMemo(
    () => event?.dates.filter((d) => eventDateIds.includes(d.id)) ?? [],
    [event, eventDateIds]
  );
  const remainingDates = useMemo(
    () =>
      event?.dates.filter(
        (d) => !registeredDateIds.includes(d.id) && d.available > 0
      ) ?? [],
    [event, registeredDateIds]
  );
  const price = event?.prices.find((p) => p.affiliation === affiliation);
  const unitPriceUsd =
    price?.isEnabled && price.amountUsd !== null ? price.amountUsd : null;
  const priceUnavailable = !!event && !!affiliation && unitPriceUsd === null;

  // Empresa y evento ya quedaron fijos en el primer envío: esto salta
  // directo al paso de Participantes para inscribir la siguiente fecha con
  // otros jugadores, sin repetir el formulario completo.
  function startChainedRegistration(dateId: string) {
    setEventDateIds([dateId]);
    setMultiDateMode(false);
    setParticipantCount(undefined);
    setParticipants([]);
    setServerError(null);
    setStep(2);
  }

  function toggleDate(dateId: string) {
    setEventDateIds((prev) =>
      prev.includes(dateId)
        ? prev.filter((id) => id !== dateId)
        : [...prev, dateId]
    );
  }

  function selectSingleDate(dateId: string) {
    setEventDateIds((prev) => (prev[0] === dateId && prev.length === 1 ? [] : [dateId]));
  }

  function handleMultiDateModeChange(checked: boolean) {
    setMultiDateMode(checked);
    if (!checked) {
      // Al desactivar, la selección vuelve a comportarse como radio: se
      // queda solo con la primera fecha marcada para no dejar un estado
      // de "2 fechas elegidas" en un modo que ya no lo permite.
      setEventDateIds((prev) => prev.slice(0, 1));
    }
  }

  const step1Ready =
    !!event && selectedDates.length > 0 && unitPriceUsd !== null;

  function submit() {
    if (!company || !event || selectedDates.length === 0) return;
    setServerError(null);
    startTransition(async () => {
      const response = await createRegistrationAction({
        ...company,
        eventId: event.id,
        eventDateIds: selectedDates.map((d) => d.id),
        participants,
      });
      if (response.ok) {
        setResult((prev) => [...(prev ?? []), ...response.registrations]);
        setRegisteredDateIds((prev) => [
          ...prev,
          ...selectedDates.map((d) => d.id),
        ]);
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
            <div key="step-0" className="step-fade-in">
              <CompanyStep
                affiliates={affiliates}
                defaultValues={company}
                onNext={(data) => {
                  setCompany(data);
                  setStep(1);
                }}
              />
            </div>
          )}

          {step === 1 && company && (
            <section key="step-1" className="step-fade-in space-y-6">
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
                      onClick={() => {
                        setEventId(e.id);
                        setEventDateIds([]);
                        setMultiDateMode(false);
                      }}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        eventId === e.id
                          ? "scale-[1.01] border-primary bg-accent"
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
                  <SectionLabel>
                    Fecha{multiDateMode ? "s" : ""}
                  </SectionLabel>

                  {event.dates.length > 1 && (
                    <label className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                      <Checkbox
                        checked={multiDateMode}
                        onCheckedChange={(checked) =>
                          handleMultiDateModeChange(checked === true)
                        }
                        className="mt-0.5"
                      />
                      <span>
                        <span className="font-medium">
                          Inscribir en más de una fecha con los mismos
                          participantes.
                        </span>{" "}
                        <span className="text-muted-foreground">
                          Si van a jugar personas distintas en cada fecha, no
                          actives esto: elige una fecha ahora y agrega la otra
                          con otros jugadores justo después de confirmar esta
                          inscripción.
                        </span>
                      </span>
                    </label>
                  )}

                  <div
                    role={multiDateMode ? "group" : "radiogroup"}
                    aria-label="Fecha"
                    className="grid gap-3"
                  >
                    {event.dates.map((d) => {
                      const full = d.available <= 0;
                      const checked = eventDateIds.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          role={multiDateMode ? "checkbox" : "radio"}
                          aria-checked={checked}
                          disabled={full}
                          onClick={() =>
                            multiDateMode
                              ? toggleDate(d.id)
                              : selectSingleDate(d.id)
                          }
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all",
                            checked
                              ? "scale-[1.01] border-primary bg-accent"
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
                      por participante
                      {selectedDates.length > 1
                        ? `, por cada una de las ${selectedDates.length} fechas elegidas.`
                        : "."}
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
            <div key="step-2" className="step-fade-in">
              <ParticipantForm
                defaultValues={participants}
                count={participantCount}
                onCountChange={setParticipantCount}
                onBack={() => setStep(1)}
                onNext={(p) => {
                  setParticipants(p);
                  setStep(3);
                }}
              />
            </div>
          )}

          {step === 3 && company && event && selectedDates.length > 0 && (
            <section key="step-3" className="step-fade-in space-y-6">
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
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Fecha{selectedDates.length > 1 ? "s" : ""} del evento
                    </p>
                    {selectedDates.map((d) => (
                      <div key={d.id} className="rounded-lg bg-accent p-4">
                        <p className="text-lg font-semibold">
                          {formatEventDate(d.date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {d.label} · {d.venue}
                        </p>
                      </div>
                    ))}
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
                    {selectedDates.length > 1
                      ? "Se generará una proforma por cada fecha, con estos mismos datos, y se enviarán al correo de la empresa."
                      : "La proforma se emitirá con estos datos y se enviará al correo de la empresa."}
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
            <section key="step-4" className="step-fade-in mx-auto max-w-xl space-y-6 text-center">
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
                  {result.length > 1
                    ? "Inscripciones generadas"
                    : "Inscripción generada"}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {result.length > 1 ? (
                    <>
                      Tus códigos de inscripción son{" "}
                      {result.map((r, i) => (
                        <span key={r.registrationId}>
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {r.code}
                          </span>
                          {i < result.length - 1 ? " y " : ""}
                        </span>
                      ))}
                      . Las proformas quedaron generadas, pendientes de pago,
                      y las enviaremos al correo registrado de tu empresa.
                    </>
                  ) : (
                    <>
                      Tu código de inscripción es{" "}
                      <span className="font-mono font-semibold tabular-nums text-foreground">
                        {result[0].code}
                      </span>
                      . La proforma quedó generada, pendiente de pago, y la
                      enviaremos al correo registrado de tu empresa.
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {result.map((r) => (
                  <Button
                    key={r.registrationId}
                    nativeButton={false}
                    render={
                      <a
                        href={`/api/proformas/${r.registrationId}/pdf`}
                        target="_blank"
                        rel="noopener"
                      />
                    }
                  >
                    {result.length > 1
                      ? `Descargar proforma ${r.code}`
                      : "Descargar proforma"}
                  </Button>
                ))}
              </div>

              {remainingDates.length > 0 && (
                <div className="rounded-lg border bg-muted/40 p-4 text-left">
                  <p className="text-sm font-medium">
                    ¿Van a jugar personas distintas en otra fecha?
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ya tenemos los datos de {company?.legalName}: solo falta
                    llenar los participantes de la otra parada.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {remainingDates.map((d) => (
                      <Button
                        key={d.id}
                        type="button"
                        variant="outline"
                        onClick={() => startChainedRegistration(d.id)}
                      >
                        Inscribir también en {d.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {step > 0 && step < 4 && (
          <PriceSummary
            eventName={event?.name}
            dates={selectedDates.map((d) => ({
              text: formatEventDate(d.date),
              venue: d.venue,
            }))}
            affiliationLabel={affiliation ? AFFILIATION_LABELS[affiliation] : undefined}
            unitPriceUsd={unitPriceUsd}
            quantity={Math.max(1, participantCount ?? participants.length)}
            rate={rate}
          />
        )}
      </div>
    </div>
  );
}
