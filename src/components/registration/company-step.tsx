"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyStepSchema,
  type CompanyStepInput,
} from "@/lib/validations/registration.schema";
import type { ActiveAffiliate } from "@/server/queries/affiliates.queries";
import { AFFILIATION_LABELS } from "@/lib/constants";
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

// Pádel ya resolvió "¿con qué situación te inscribes?" (afiliado /
// patrocinador / club / público) en el paso anterior — este paso solo pide
// los datos de contacto. Golf sigue preguntando la membresía aquí mismo,
// porque nunca tuvo el mismo problema de saturación (menos opciones).
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
    onNext(data);
  }

  const readyToSubmit = isPadel ? true : isAffiliated !== undefined;

  return (
    <form onSubmit={handleSubmit(handleSubmitClick)} className="space-y-6">
      {isPadel ? (
        <>
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
