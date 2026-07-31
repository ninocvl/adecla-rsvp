"use client";

import { useMemo, useState } from "react";
import {
  normalizeRnc,
  PADEL_PARTICIPANT_TYPES,
} from "@/lib/validations/registration.schema";
import type { ActiveAffiliate } from "@/server/queries/affiliates.queries";
import {
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

export type PadelParticipantType =
  (typeof PADEL_PARTICIPANT_TYPES)[number];

export interface PadelSituationValue {
  padelParticipantType?: PadelParticipantType;
  padelCategory?: string;
  padelClub?: string;
  affiliateId?: string;
  affiliateName?: string;
  affiliateAffiliationType?: string;
  sponsorName?: string;
  sponsorRnc?: string;
}

interface PadelSituationStepProps {
  affiliates: ActiveAffiliate[];
  defaultValues?: PadelSituationValue;
  onBack: () => void;
  onNext: (value: PadelSituationValue) => void;
}

const SITUATION_OPTIONS: {
  value: PadelParticipantType;
  label: string;
  hint: string;
}[] = [
  { value: "AFILIADO", label: "Soy afiliado de ADECLA", hint: "Tarifa normal" },
  { value: "PATROCINADOR", label: "Me invita un patrocinador", hint: "Sin costo" },
  {
    value: "CLUB",
    label: "Soy de un club de pádel",
    hint: `${PADEL_CLUB_DISCOUNT_RATE * 100}% de descuento`,
  },
  {
    value: "PUBLICO",
    label: "Ninguna de las anteriores, ¡quiero participar!",
    hint: "Tarifa normal",
  },
];

export function PadelSituationStep({
  affiliates,
  defaultValues,
  onBack,
  onNext,
}: PadelSituationStepProps) {
  const [participantType, setParticipantType] = useState<
    PadelParticipantType | undefined
  >(defaultValues?.padelParticipantType);
  const [category, setCategory] = useState<string | undefined>(
    defaultValues?.padelCategory
  );
  const [club, setClub] = useState<string | undefined>(
    defaultValues?.padelClub
  );
  const [selectedAffiliate, setSelectedAffiliate] =
    useState<ActiveAffiliate | null>(
      affiliates.find((a) => a.id === defaultValues?.affiliateId) ?? null
    );
  const [search, setSearch] = useState(selectedAffiliate?.name ?? "");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [affiliateError, setAffiliateError] = useState(false);
  const [sponsorName, setSponsorName] = useState(
    defaultValues?.sponsorName ?? ""
  );
  const [sponsorRnc, setSponsorRnc] = useState(
    defaultValues?.sponsorRnc ?? ""
  );
  const [sponsorErrors, setSponsorErrors] = useState<{
    name?: boolean;
    rnc?: boolean;
  }>({});
  // El RNC del patrocinador no coincidió con la lista real: no bloquea el
  // envío, pero exige que la persona confirme explícitamente antes de dejarla
  // seguir. El admin igual la ve marcada para revisarla (sponsorRncVerified).
  const [sponsorRncAcknowledged, setSponsorRncAcknowledged] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [clubError, setClubError] = useState(false);

  const sponsorMatch = useMemo(() => {
    if (!sponsorRnc) return null;
    if (normalizeRnc(sponsorRnc).length < 9) return null;
    return findMatchingSponsor(sponsorRnc);
  }, [sponsorRnc]);
  const sponsorRncTyped = normalizeRnc(sponsorRnc).length >= 9;
  const sponsorRncMismatch =
    participantType === "PATROCINADOR" && sponsorRncTyped && !sponsorMatch;

  const filteredAffiliates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return affiliates.slice(0, 20);
    return affiliates.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 20);
  }, [affiliates, search]);

  function chooseType(value: PadelParticipantType) {
    setParticipantType(value);
    setAffiliateError(false);
    setSponsorErrors({});
    setClubError(false);
    setSponsorRncAcknowledged(false);
    if (value !== "AFILIADO") {
      setSelectedAffiliate(null);
      setSearch("");
    }
    if (value !== "CLUB") setClub(undefined);
    if (value !== "PATROCINADOR") {
      setSponsorName("");
      setSponsorRnc("");
    }
  }

  function selectAffiliate(affiliate: ActiveAffiliate) {
    setSelectedAffiliate(affiliate);
    setSearch(affiliate.name);
    setComboboxOpen(false);
    setAffiliateError(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!category) {
      setCategoryError(true);
      ok = false;
    }
    if (participantType === "AFILIADO" && !selectedAffiliate) {
      setAffiliateError(true);
      ok = false;
    }
    if (participantType === "CLUB" && !club) {
      setClubError(true);
      ok = false;
    }
    if (participantType === "PATROCINADOR") {
      const errors = {
        name: sponsorName.trim().length < 2,
        rnc: !sponsorRncTyped,
      };
      setSponsorErrors(errors);
      if (errors.name || errors.rnc) ok = false;
      if (sponsorRncMismatch && !sponsorRncAcknowledged) ok = false;
    }
    if (!participantType || !ok) return;

    onNext({
      padelParticipantType: participantType,
      padelCategory: category,
      padelClub: participantType === "CLUB" ? club : undefined,
      affiliateId:
        participantType === "AFILIADO" ? selectedAffiliate?.id : undefined,
      affiliateName:
        participantType === "AFILIADO" ? selectedAffiliate?.name : undefined,
      affiliateAffiliationType:
        participantType === "AFILIADO"
          ? (selectedAffiliate?.affiliationType ?? undefined)
          : undefined,
      sponsorName: participantType === "PATROCINADOR" ? sponsorName : undefined,
      sponsorRnc: participantType === "PATROCINADOR" ? sponsorRnc : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>¿Con qué situación te inscribes?</Label>
        <div className="grid grid-cols-2 gap-3">
          {SITUATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => chooseType(opt.value)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-all",
                participantType === opt.value
                  ? "scale-[1.01] border-primary bg-accent"
                  : "hover:border-primary/40"
              )}
            >
              <span className="block">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {participantType === "AFILIADO" && (
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
          {affiliateError && (
            <p className="text-sm text-destructive">
              Selecciona tu empresa de la lista.
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

      {participantType === "CLUB" && (
        <div className="space-y-2">
          <Label htmlFor="padelClub">Tu club</Label>
          <Select value={club ?? ""} onValueChange={(v) => setClub(v ?? undefined)}>
            <SelectTrigger id="padelClub" className="w-full">
              <SelectValue placeholder="Selecciona tu club">
                {(value: string | null) => (value ? PADEL_CLUB_LABELS[value] : null)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PADEL_CLUB_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clubError && (
            <p className="text-sm text-destructive">Selecciona tu club.</p>
          )}
          <p className="text-xs text-primary">
            Los socios de un club con convenio pagan la inscripción con un{" "}
            {PADEL_CLUB_DISCOUNT_RATE * 100}% de descuento.
          </p>
        </div>
      )}

      {participantType === "PATROCINADOR" && (
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
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
            />
            {sponsorErrors.name && (
              <p className="text-sm text-destructive">
                Escribe el nombre del patrocinador.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sponsorRnc">RNC del patrocinador</Label>
            <Input
              id="sponsorRnc"
              placeholder="130123456"
              value={sponsorRnc}
              onChange={(e) => {
                setSponsorRnc(e.target.value);
                setSponsorRncAcknowledged(false);
              }}
            />
            {sponsorErrors.rnc && (
              <p className="text-sm text-destructive">
                El RNC del patrocinador debe tener 9 dígitos.
              </p>
            )}
            {sponsorRncMismatch && (
              <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
                <p className="font-medium text-amber-900">
                  No encontramos ese RNC en nuestra lista de patrocinadores.
                </p>
                <p className="text-amber-800">
                  Puedes seguir de todas formas: lo revisaremos antes de
                  confirmar tu cupo. ¿Estás seguro de que el RNC es correcto?
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

      {participantType && (
        <div className="space-y-2">
          <Label htmlFor="padelCategory">Tu categoría</Label>
          <Select value={category ?? ""} onValueChange={(v) => setCategory(v ?? undefined)}>
            <SelectTrigger id="padelCategory" className="w-full">
              <SelectValue placeholder="Selecciona tu categoría">
                {(value: string | null) =>
                  value ? PADEL_CATEGORY_LABELS[value] : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PADEL_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryError && (
            <p className="text-sm text-destructive">Selecciona tu categoría.</p>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit" disabled={!participantType}>
          Continuar
        </Button>
      </div>
    </form>
  );
}
