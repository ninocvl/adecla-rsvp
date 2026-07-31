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

interface FieldProps {
  id: keyof CompanyStepInput;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

const manualFields: FieldProps[] = [
  {
    id: "contactName",
    label: "Nombre del contacto",
    placeholder: "Juan Pérez",
    autoComplete: "name",
  },
  { id: "rnc", label: "RNC o cédula", placeholder: "130123456" },
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
  const padelParticipantType = watch("padelParticipantType");
  const sponsorRnc = watch("sponsorRnc");
  const isPatrocinador = padelParticipantType === "PATROCINADOR";

  const sponsorMatch = useMemo(() => {
    if (!sponsorRnc) return null;
    const normalized = normalizeRnc(sponsorRnc);
    if (normalized.length < 9) return null;
    return findMatchingSponsor(sponsorRnc);
  }, [sponsorRnc]);
  const sponsorRncTyped = sponsorRnc ? normalizeRnc(sponsorRnc).length >= 9 : false;
  const sponsorRncMismatch =
    isPatrocinador && sponsorRncTyped && !sponsorMatch;

  const filteredAffiliates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return affiliates.slice(0, 20);
    return affiliates
      .filter((a) => a.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [affiliates, search]);

  function chooseAffiliation(value: boolean) {
    setValue("isAffiliated", value);
    if (value) {
      setValue("wantsToAffiliate", false);
    } else {
      setValue("affiliateId", undefined);
      setSelectedAffiliate(null);
    }
  }

  function choosePadelType(
    value: (typeof PADEL_PARTICIPANT_TYPES)[number]
  ) {
    setValue("padelParticipantType", value);
    setValue("isSponsorGuest", value === "PATROCINADOR");
    setSponsorRncAcknowledged(false);
    if (value !== "PATROCINADOR") {
      setValue("sponsorName", "");
      setValue("sponsorRnc", "");
    }
    if (value !== "CLUB") {
      setValue("padelClub", undefined);
    }
    if (value === "AFILIADO") {
      setValue("isAffiliated", true);
    } else {
      setValue("isAffiliated", false);
      setValue("affiliateId", undefined);
      setSelectedAffiliate(null);
    }
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

  // Compartido entre golf ("Sí, mi empresa es miembro") y pádel
  // ("Soy afiliado de ADECLA"): mismo listado de socios, mismo estado.
  function renderAffiliateSearch() {
    return (
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
                  No encontramos esa empresa en nuestro registro de miembros.
                  Verifica el nombre o escríbenos.
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
            abajo. La administración de ADECLA confirma los datos antes de
            aprobar la inscripción.
          </p>
        )}
      </div>
    );
  }

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
    onNext(data);
  }

  const readyToSubmit = isPadel
    ? padelParticipantType !== undefined &&
      (!sponsorRncMismatch || sponsorRncAcknowledged)
    : isAffiliated !== undefined;

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)} className="space-y-6">
      {isPadel ? (
        <>
          <div className="space-y-2">
            <Label>¿Con qué situación te inscribes?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => choosePadelType("AFILIADO")}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  padelParticipantType === "AFILIADO"
                    ? "scale-[1.01] border-primary bg-accent"
                    : "hover:border-primary/40"
                )}
              >
                Soy afiliado de ADECLA
              </button>
              <button
                type="button"
                onClick={() => choosePadelType("PATROCINADOR")}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  padelParticipantType === "PATROCINADOR"
                    ? "scale-[1.01] border-primary bg-accent"
                    : "hover:border-primary/40"
                )}
              >
                Me invita un patrocinador
              </button>
              <button
                type="button"
                onClick={() => choosePadelType("CLUB")}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  padelParticipantType === "CLUB"
                    ? "scale-[1.01] border-primary bg-accent"
                    : "hover:border-primary/40"
                )}
              >
                Soy de un club de pádel
              </button>
              <button
                type="button"
                onClick={() => choosePadelType("PUBLICO")}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  padelParticipantType === "PUBLICO"
                    ? "scale-[1.01] border-primary bg-accent"
                    : "hover:border-primary/40"
                )}
              >
                Ninguna de las anteriores, ¡quiero participar!
              </button>
            </div>
            {errors.padelParticipantType && (
              <p className="text-sm text-destructive">
                Indica tu situación para la inscripción.
              </p>
            )}
          </div>

          {padelParticipantType === "AFILIADO" && renderAffiliateSearch()}

          {padelParticipantType === "CLUB" && (
            <div className="space-y-2">
              <Label htmlFor="padelClub">Tu club</Label>
              <Controller
                name="padelClub"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
                Los socios de un club con convenio pagan la inscripción con
                un {PADEL_CLUB_DISCOUNT_RATE * 100}% de descuento.
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

          <div className="space-y-2">
            <Label htmlFor="padelCategory">Tu categoría</Label>
            <Controller
              name="padelCategory"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
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

          {renderField({
            id: "legalName",
            label: "Nombre completo o razón social",
            placeholder: "Juan Pérez o Constructora Ejemplo, S.R.L.",
            autoComplete: "name",
          })}
          {manualFields.map((f) => renderField(f))}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>¿Tu empresa ya es miembro de ADECLA?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => chooseAffiliation(true)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  isAffiliated === true
                    ? "scale-[1.01] border-primary bg-accent"
                    : "hover:border-primary/40"
                )}
              >
                Sí, mi empresa es miembro de ADECLA
              </button>
              <button
                type="button"
                onClick={() => chooseAffiliation(false)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-all",
                  isAffiliated === false
                    ? "scale-[1.01] border-primary bg-accent"
                    : "hover:border-primary/40"
                )}
              >
                No, aún no es miembro
              </button>
            </div>
            {errors.isAffiliated && (
              <p className="text-sm text-destructive">
                Indica si tu empresa ya es miembro de ADECLA.
              </p>
            )}
          </div>

          {isAffiliated === true && renderAffiliateSearch()}

          {isAffiliated === false && (
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

          {isAffiliated !== undefined && isAffiliated !== null && (
            <>
              {renderField(
                {
                  id: "legalName",
                  label: "Razón social",
                  placeholder: "Constructora Ejemplo, S.R.L.",
                  autoComplete: "organization",
                },
                !!selectedAffiliate
              )}

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

              {manualFields.map((f) => renderField(f))}
            </>
          )}
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
