"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyStepSchema,
  normalizeRnc,
  PADEL_PARTICIPANT_TYPES,
  type CompanyStepInput,
} from "@/lib/validations/registration.schema";
import type { ActiveAffiliate } from "@/server/queries/affiliates.queries";
import {
  AFFILIATION_LABELS,
  PADEL_CATEGORY_LABELS,
  PADEL_CLUB_DISCOUNT_RATE,
  PADEL_CLUB_LABELS,
} from "@/lib/constants";
import { findMatchingSponsor } from "@/lib/sponsors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PadelParticipantType = (typeof PADEL_PARTICIPANT_TYPES)[number];
type GolfSituation = "AFILIADO" | "PATROCINADOR" | "PUBLICO";

interface FieldProps {
  id: keyof CompanyStepInput;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

function getManualFields(isPadel: boolean): FieldProps[] {
  return [
    {
      id: "contactName",
      label: "Nombre del contacto",
      placeholder: "Juan Pérez",
      autoComplete: "name",
    },
    // Golf inscribe empresas dominicanas (siempre tienen RNC). Pádel abre a
    // jugadores extranjeros sin RNC ni cédula, así que ahí también se acepta
    // pasaporte.
    isPadel
      ? {
          id: "rnc",
          label: "RNC, cédula o pasaporte",
          placeholder: "130123456 o pasaporte",
        }
      : { id: "rnc", label: "RNC o cédula", placeholder: "130123456" },
    {
      id: "email",
      label: "Correo electrónico",
      type: "email",
      placeholder: "empresa@ejemplo.com",
      autoComplete: "email",
    },
    {
      id: "phone",
      label: "Teléfono",
      type: "tel",
      placeholder: "809-555-0000",
      autoComplete: "tel",
    },
  ];
}

const SITUATION_OPTIONS: { value: PadelParticipantType; label: string }[] = [
  { value: "AFILIADO", label: "Afiliado de ADECLA" },
  { value: "PATROCINADOR", label: "Invitado de un patrocinador" },
  { value: "CLUB", label: "Pertenezco a un club de pádel" },
  {
    value: "PUBLICO",
    label: "Ninguna de las anteriores, ¡quiero participar!",
  },
];

// Golf no tiene club con convenio (eso es solo pádel): mismas 3 primeras
// opciones, sin la de club.
const GOLF_SITUATION_OPTIONS: { value: GolfSituation; label: string }[] = [
  { value: "AFILIADO", label: "Afiliado de ADECLA" },
  { value: "PATROCINADOR", label: "Invitado de un patrocinador" },
  {
    value: "PUBLICO",
    label: "Ninguna de las anteriores, ¡quiero participar!",
  },
];

interface CompanyStepProps {
  eventSlug: string;
  affiliates: ActiveAffiliate[];
  defaultValues?: Partial<CompanyStepInput>;
  onNext: (data: CompanyStepInput) => void;
}

export function CompanyStep({
  eventSlug,
  affiliates,
  defaultValues,
  onNext,
}: CompanyStepProps) {
  const isPadel = eventSlug === "padel";

  const [selectedAffiliate, setSelectedAffiliate] =
    useState<ActiveAffiliate | null>(
      affiliates.find((a) => a.id === defaultValues?.affiliateId) ?? null
    );
  const [search, setSearch] = useState(selectedAffiliate?.name ?? "");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  // El RNC del patrocinador no coincidió con la lista real: no bloquea el
  // envío, pero exige que la persona confirme explícitamente antes de dejarla
  // seguir. El admin igual la ve marcada para revisarla (sponsorRncVerified).
  const [sponsorRncAcknowledged, setSponsorRncAcknowledged] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyStepInput>({
    resolver: zodResolver(companyStepSchema),
    defaultValues: {
      isAffiliated: undefined as unknown as boolean,
      affiliateId: undefined,
      wantsToAffiliate: false,
      isSponsorGuest: undefined as unknown as boolean,
      sponsorName: "",
      sponsorRnc: "",
      padelParticipantType: undefined,
      padelClub: undefined,
      padelCategory: undefined,
      legalName: "",
      rnc: "",
      affiliationType: undefined,
      contactName: "",
      email: "",
      phone: "",
      ...defaultValues,
      eventSlug,
    },
  });

  const isAffiliated = watch("isAffiliated");
  const isSponsorGuest = watch("isSponsorGuest");
  const padelParticipantType = watch("padelParticipantType");
  const sponsorName = watch("sponsorName") ?? "";
  const sponsorRnc = watch("sponsorRnc") ?? "";

  const filteredAffiliates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return affiliates.slice(0, 20);
    return affiliates
      .filter((a) => a.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [affiliates, search]);

  const sponsorMatch = useMemo(() => {
    if (!sponsorRnc) return null;
    if (normalizeRnc(sponsorRnc).length < 9) return null;
    return findMatchingSponsor(sponsorRnc);
  }, [sponsorRnc]);
  const sponsorRncTyped = normalizeRnc(sponsorRnc).length >= 9;
  const isSponsorSituation =
    padelParticipantType === "PATROCINADOR" || (!isPadel && isSponsorGuest === true);
  const sponsorRncMismatch = isSponsorSituation && sponsorRncTyped && !sponsorMatch;

  function chooseGolfSituation(value: GolfSituation) {
    setValue("isAffiliated", value === "AFILIADO", { shouldValidate: true });
    setValue("isSponsorGuest", value === "PATROCINADOR");
    setValue("affiliationType", undefined);
    setSponsorRncAcknowledged(false);
    if (value === "AFILIADO") {
      setValue("wantsToAffiliate", false);
    } else {
      setValue("affiliateId", undefined);
      setSelectedAffiliate(null);
    }
    if (value !== "PATROCINADOR") {
      setValue("sponsorName", "");
      setValue("sponsorRnc", "");
    }
  }

  // Vuelve a la pregunta de situación sin perder los datos de contacto ya
  // escritos: solo limpia lo que dependía de la situación anterior.
  function resetGolfSituation() {
    setValue("isAffiliated", undefined as unknown as boolean);
    setValue("isSponsorGuest", undefined as unknown as boolean);
    setValue("affiliateId", undefined);
    setValue("affiliationType", undefined);
    setValue("wantsToAffiliate", false);
    setValue("sponsorName", "");
    setValue("sponsorRnc", "");
    setSelectedAffiliate(null);
    setSearch("");
    setSponsorRncAcknowledged(false);
  }

  function choosePadelSituation(value: PadelParticipantType) {
    setValue("padelParticipantType", value, { shouldValidate: true });
    setValue("isSponsorGuest", value === "PATROCINADOR");
    setValue("isAffiliated", value === "AFILIADO");
    setSponsorRncAcknowledged(false);
    if (value !== "AFILIADO") {
      setSelectedAffiliate(null);
      setSearch("");
      setValue("affiliateId", undefined);
    }
    if (value !== "CLUB") setValue("padelClub", undefined);
    if (value !== "PATROCINADOR") {
      setValue("sponsorName", "");
      setValue("sponsorRnc", "");
    }
  }

  // Vuelve a la pregunta de situación sin perder categoría ni los datos de
  // contacto ya escritos: solo limpia lo que dependía de la situación
  // anterior (club, patrocinador, afiliado).
  function resetPadelSituation() {
    setValue("padelParticipantType", undefined);
    setValue("isSponsorGuest", undefined as unknown as boolean);
    setValue("isAffiliated", undefined as unknown as boolean);
    setValue("affiliateId", undefined);
    setValue("padelClub", undefined);
    setValue("sponsorName", "");
    setValue("sponsorRnc", "");
    setSelectedAffiliate(null);
    setSearch("");
    setSponsorRncAcknowledged(false);
  }

  function selectAffiliate(affiliate: ActiveAffiliate) {
    setSelectedAffiliate(affiliate);
    setSearch(affiliate.name);
    setComboboxOpen(false);
    setValue("affiliateId", affiliate.id, { shouldValidate: true });
    setValue("legalName", affiliate.name);
    if (affiliate.affiliationType) {
      setValue("affiliationType", affiliate.affiliationType);
    }
  }

  // Para un miembro conocido, la categoría ya está fijada en el registro de
  // socios: no tiene sentido ofrecerla como elección editable.
  const affiliationTypeLocked = !!selectedAffiliate?.affiliationType;

  function renderField(field: FieldProps, disabled = false) {
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        <Input
          id={field.id}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          disabled={disabled}
          {...register(field.id)}
        />
        {errors[field.id] && (
          <p className="text-sm text-destructive">
            {errors[field.id]?.message as string}
          </p>
        )}
      </div>
    );
  }

  function handleSubmitClick(data: CompanyStepInput) {
    if (
      (data.padelParticipantType === "PATROCINADOR" || data.isSponsorGuest) &&
      sponsorRncMismatch &&
      !sponsorRncAcknowledged
    ) {
      return;
    }
    onNext(data);
  }

  const readyToSubmit = isPadel
    ? padelParticipantType !== undefined
    : isAffiliated !== undefined;

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)} className="space-y-6">
      {isPadel && padelParticipantType === undefined && (
        <div className="space-y-2">
          <Label>Confirma si eres</Label>
          <div className="grid grid-cols-2 gap-3">
            {SITUATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => choosePadelSituation(opt.value)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  "hover:border-primary/40"
                )}
              >
                <span className="block">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isPadel && padelParticipantType !== undefined && (
        <>
          {padelParticipantType === "AFILIADO" && (
            <div className="space-y-2">
              <Label htmlFor="affiliate-search">Busca tu empresa</Label>
              <div className="relative">
                <Input
                  id="affiliate-search"
                  placeholder="Escribe el nombre de tu empresa…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setComboboxOpen(true);
                    if (selectedAffiliate) setSelectedAffiliate(null);
                  }}
                  onFocus={() => setComboboxOpen(true)}
                  autoComplete="off"
                />
                {comboboxOpen && (
                  <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover shadow-md">
                    {filteredAffiliates.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-muted-foreground">
                        No encontramos esa empresa en nuestro registro de
                        miembros. Verifica el nombre o escríbenos.
                      </p>
                    ) : (
                      filteredAffiliates.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => selectAffiliate(a)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          {a.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.affiliateId && (
                <p className="text-sm text-destructive">
                  {errors.affiliateId.message}
                </p>
              )}
              {selectedAffiliate && (
                <p className="text-xs text-muted-foreground">
                  Encontramos tu empresa. La administración de ADECLA confirma
                  los datos antes de aprobar la inscripción.
                </p>
              )}
            </div>
          )}

          {padelParticipantType === "CLUB" && (
            <div className="space-y-2">
              <Label htmlFor="padelClub">Tu club</Label>
              <Controller
                name="padelClub"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v ?? undefined)}
                  >
                    <SelectTrigger id="padelClub" className="w-full">
                      <SelectValue placeholder="Selecciona tu club">
                        {(value: string | null) =>
                          value ? PADEL_CLUB_LABELS[value] : null
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PADEL_CLUB_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.padelClub && (
                <p className="text-sm text-destructive">
                  {errors.padelClub.message}
                </p>
              )}
              <p className="text-xs text-primary">
                Los socios de un club con convenio pagan la inscripción con un{" "}
                {PADEL_CLUB_DISCOUNT_RATE * 100}% de descuento.
              </p>
            </div>
          )}

          {padelParticipantType === "PATROCINADOR" && (
            <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Al ser invitado de un patrocinador, tu inscripción no genera
                proforma ni tiene costo.
              </p>
              <div className="space-y-2">
                <Label htmlFor="sponsorName">Empresa patrocinadora</Label>
                <Input
                  id="sponsorName"
                  placeholder="Nombre del patrocinador"
                  {...register("sponsorName")}
                />
                {errors.sponsorName && (
                  <p className="text-sm text-destructive">
                    {errors.sponsorName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorRnc">RNC del patrocinador</Label>
                <Input
                  id="sponsorRnc"
                  placeholder="130123456"
                  {...register("sponsorRnc", {
                    onChange: () => setSponsorRncAcknowledged(false),
                  })}
                />
                {errors.sponsorRnc && (
                  <p className="text-sm text-destructive">
                    {errors.sponsorRnc.message}
                  </p>
                )}
                {sponsorRncMismatch && (
                  <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
                    <p className="font-medium text-amber-900">
                      No encontramos ese RNC en nuestra lista de
                      patrocinadores.
                    </p>
                    <p className="text-amber-800">
                      Puedes seguir de todas formas: lo revisaremos antes de
                      confirmar tu cupo. ¿Estás seguro de que el RNC es
                      correcto?
                    </p>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={sponsorRncAcknowledged}
                        onCheckedChange={(checked) =>
                          setSponsorRncAcknowledged(checked === true)
                        }
                      />
                      <span>Sí, el RNC es correcto.</span>
                    </label>
                  </div>
                )}
                {sponsorMatch && (
                  <p className="text-sm text-primary">
                    Encontramos a {sponsorMatch.name} en nuestra lista de
                    patrocinadores.
                  </p>
                )}
              </div>
            </div>
          )}

          {padelParticipantType && (
            <div className="space-y-2">
              <Label htmlFor="padelCategory">Tu categoría</Label>
              <Controller
                name="padelCategory"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v ?? undefined)}
                  >
                    <SelectTrigger id="padelCategory" className="w-full">
                      <SelectValue placeholder="Selecciona tu categoría">
                        {(value: string | null) =>
                          value ? PADEL_CATEGORY_LABELS[value] : null
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PADEL_CATEGORY_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.padelCategory && (
                <p className="text-sm text-destructive">
                  {errors.padelCategory.message}
                </p>
              )}
            </div>
          )}

          {renderField({
            id: "legalName",
            label: "Nombre completo o razón social",
            placeholder: "Juan Pérez o Constructora Ejemplo, S.R.L.",
            autoComplete: "name",
          })}
          {getManualFields(true).map((f) => renderField(f))}

          <button
            type="button"
            onClick={resetPadelSituation}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Cambiar situación
          </button>
        </>
      )}

      {!isPadel && isAffiliated === undefined && (
        <div className="space-y-2">
          <Label>Confirma si eres</Label>
          <div className="grid grid-cols-2 gap-3">
            {GOLF_SITUATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => chooseGolfSituation(opt.value)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  "hover:border-primary/40"
                )}
              >
                <span className="block">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isPadel && isAffiliated !== undefined && (
        <>
          {isAffiliated === true && (
            <div className="space-y-2">
              <Label htmlFor="affiliate-search">Busca tu empresa</Label>
              <div className="relative">
                <Input
                  id="affiliate-search"
                  placeholder="Escribe el nombre de tu empresa…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setComboboxOpen(true);
                    if (selectedAffiliate) setSelectedAffiliate(null);
                  }}
                  onFocus={() => setComboboxOpen(true)}
                  autoComplete="off"
                />
                {comboboxOpen && (
                  <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover shadow-md">
                    {filteredAffiliates.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-muted-foreground">
                        No encontramos esa empresa en nuestro registro de
                        miembros. Verifica el nombre o escríbenos.
                      </p>
                    ) : (
                      filteredAffiliates.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => selectAffiliate(a)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          {a.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.affiliateId && (
                <p className="text-sm text-destructive">
                  {errors.affiliateId.message}
                </p>
              )}
              {selectedAffiliate && (
                <p className="text-xs text-muted-foreground">
                  Encontramos tu empresa. Completa o corrige lo que haga falta
                  abajo. La administración de ADECLA confirma los datos antes
                  de aprobar la inscripción.
                </p>
              )}
            </div>
          )}

          {isSponsorGuest && (
            <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Al ser invitado de un patrocinador, tu inscripción no genera
                proforma ni tiene costo.
              </p>
              <div className="space-y-2">
                <Label htmlFor="sponsorName">Empresa patrocinadora</Label>
                <Input
                  id="sponsorName"
                  placeholder="Nombre del patrocinador"
                  {...register("sponsorName")}
                />
                {errors.sponsorName && (
                  <p className="text-sm text-destructive">
                    {errors.sponsorName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorRnc">RNC del patrocinador</Label>
                <Input
                  id="sponsorRnc"
                  placeholder="130123456"
                  {...register("sponsorRnc", {
                    onChange: () => setSponsorRncAcknowledged(false),
                  })}
                />
                {errors.sponsorRnc && (
                  <p className="text-sm text-destructive">
                    {errors.sponsorRnc.message}
                  </p>
                )}
                {sponsorRncMismatch && (
                  <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
                    <p className="font-medium text-amber-900">
                      No encontramos ese RNC en nuestra lista de
                      patrocinadores.
                    </p>
                    <p className="text-amber-800">
                      Puedes seguir de todas formas: lo revisaremos antes de
                      confirmar tu cupo. ¿Estás seguro de que el RNC es
                      correcto?
                    </p>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={sponsorRncAcknowledged}
                        onCheckedChange={(checked) =>
                          setSponsorRncAcknowledged(checked === true)
                        }
                      />
                      <span>Sí, el RNC es correcto.</span>
                    </label>
                  </div>
                )}
                {sponsorMatch && (
                  <p className="text-sm text-primary">
                    Encontramos a {sponsorMatch.name} en nuestra lista de
                    patrocinadores.
                  </p>
                )}
              </div>
            </div>
          )}

          {isAffiliated === false && !isSponsorGuest && (
            <label className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
              <Checkbox
                checked={watch("wantsToAffiliate")}
                onCheckedChange={(checked) =>
                  setValue("wantsToAffiliate", checked === true)
                }
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Quiero ser miembro de ADECLA.</span>{" "}
                <span className="text-muted-foreground">
                  La administración te contactará para el proceso de
                  membresía.
                </span>
              </span>
            </label>
          )}

          {renderField(
            {
              id: "legalName",
              label: "Razón social",
              placeholder: "Constructora Ejemplo, S.R.L.",
              autoComplete: "organization",
            },
            !!selectedAffiliate
          )}

          {!isSponsorGuest && (
            <div className="space-y-2">
              <Label htmlFor="affiliationType">Tipo de empresa</Label>
              <Controller
                name="affiliationType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={affiliationTypeLocked}
                  >
                    <SelectTrigger id="affiliationType" className="w-full">
                      <SelectValue placeholder="Selecciona el tipo de empresa">
                        {(value: string | null) =>
                          value ? AFFILIATION_LABELS[value] : null
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AFFILIATION_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.affiliationType && (
                <p className="text-sm text-destructive">
                  {errors.affiliationType.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {affiliationTypeLocked
                  ? "Ya está fijado según tu registro de membresía."
                  : "Define la tarifa de inscripción a los torneos."}
              </p>
            </div>
          )}

          {getManualFields(false).map((f) => renderField(f))}

          <button
            type="button"
            onClick={resetGolfSituation}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Cambiar situación
          </button>
        </>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!readyToSubmit}>
          Continuar
        </Button>
      </div>
    </form>
  );
}
