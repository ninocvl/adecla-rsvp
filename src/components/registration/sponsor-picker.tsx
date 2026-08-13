"use client";

import { useMemo, useState } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CompanyStepInput } from "@/lib/validations/registration.schema";
import { SPONSORS } from "@/lib/sponsors";
import { buscarEmpresas } from "@/lib/buscar-empresa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SponsorPickerProps {
  sponsorName: string;
  sponsorRnc: string;
  register: UseFormRegister<CompanyStepInput>;
  errors: FieldErrors<CompanyStepInput>;
  /** Fija nombre y RNC a la vez: los dos salen de la misma fila de la lista. */
  onPick: (sponsor: { name: string; rnc: string } | null) => void;
  /** El aviso de RNC desconocido solo aplica al patrocinador escrito a mano. */
  rncMismatch: boolean;
  acknowledged: boolean;
  onAcknowledge: (v: boolean) => void;
}

/**
 * Elegir el patrocinador de la lista real en vez de escribir su nombre y su
 * RNC a mano. Antes había que teclear los dos, y el RNC copiado de un
 * WhatsApp casi nunca coincidía con la lista: la inscripción quedaba marcada
 * para revisar aunque el patrocinador fuera legítimo.
 *
 * Queda la vía manual para un patrocinador que todavía no esté en la lista,
 * con la verificación blanda de siempre.
 */
export function SponsorPicker({
  sponsorName,
  sponsorRnc,
  register,
  errors,
  onPick,
  rncMismatch,
  acknowledged,
  onAcknowledge,
}: SponsorPickerProps) {
  const [manual, setManual] = useState(false);
  const [search, setSearch] = useState(sponsorName);
  const [abierto, setAbierto] = useState(false);

  const elegido = useMemo(
    () => SPONSORS.find((s) => s.name === sponsorName) ?? null,
    [sponsorName]
  );
  const resultados = useMemo(
    () => buscarEmpresas(SPONSORS, search),
    [search]
  );

  if (manual) {
    return (
      <>
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
              onChange: () => onAcknowledge(false),
            })}
          />
          {errors.sponsorRnc && (
            <p className="text-sm text-destructive">
              {errors.sponsorRnc.message}
            </p>
          )}
          {rncMismatch && (
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
                  checked={acknowledged}
                  onCheckedChange={(checked) => onAcknowledge(checked === true)}
                />
                <span>Sí, el RNC es correcto.</span>
              </label>
            </div>
          )}
        </div>

        <button
          type="button"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            setManual(false);
            onPick(null);
            setSearch("");
            onAcknowledge(false);
          }}
        >
          Volver a buscarlo en la lista
        </button>
      </>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="sponsor-search">Busca el patrocinador</Label>
      <div className="relative">
        <Input
          id="sponsor-search"
          placeholder="Escribe el nombre del patrocinador…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setAbierto(true);
            if (elegido) onPick(null);
          }}
          onFocus={() => setAbierto(true)}
          autoComplete="off"
        />
        {abierto && (
          <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover shadow-md">
            {resultados.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                No encontramos ese patrocinador en la lista.
              </p>
            ) : (
              resultados.map((s) => (
                <button
                  key={s.rnc}
                  type="button"
                  onClick={() => {
                    onPick(s);
                    setSearch(s.name);
                    setAbierto(false);
                    onAcknowledge(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {s.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {errors.sponsorName && (
        <p className="text-sm text-destructive">{errors.sponsorName.message}</p>
      )}

      {elegido ? (
        <p className="text-sm text-primary">
          RNC <span className="font-mono">{sponsorRnc}</span>. No hace falta
          que lo escribas.
        </p>
      ) : (
        <button
          type="button"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            setManual(true);
            onPick(null);
          }}
        >
          Mi patrocinador no está en la lista
        </button>
      )}
    </div>
  );
}
