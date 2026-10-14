"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deshacerIngresoAction,
  registrarIngresoAction,
} from "@/server/actions/checkin.actions";
import { cn } from "@/lib/utils";

export interface CheckinEntrada {
  id: string;
  codigo: string; // XXXX-XXXX
  nombre: string;
  tipo: "AFILIADO" | "EXTERNO";
  cupos: number;
  ingresados: number;
  anulada: boolean;
  /** Hora (ISO) del último ingreso vigente, para el estado rojo. */
  ultimoIngresoAt: string | null;
}

const TIPO: Record<string, string> = {
  AFILIADO: "Afiliado",
  EXTERNO: "Invitado externo",
};

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-DO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Santo_Domingo",
  });
}

export function CheckinPanel({
  entrada,
  puedeMarcar,
}: {
  entrada: CheckinEntrada;
  puedeMarcar: boolean;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(
    null
  );

  const restantes = entrada.cupos - entrada.ingresados;
  const estado = entrada.anulada
    ? "anulada"
    : entrada.ingresados === 0
      ? "valida"
      : restantes > 0
        ? "parcial"
        : "usada";

  const tema = {
    valida: { caja: "border-emerald-500 bg-emerald-50", etiqueta: "bg-emerald-600", titulo: "Válida" },
    parcial: { caja: "border-amber-500 bg-amber-50", etiqueta: "bg-amber-500", titulo: `Parcialmente usada · quedan ${restantes}` },
    usada: { caja: "border-red-500 bg-red-50", etiqueta: "bg-red-600", titulo: "Ya usada" },
    anulada: { caja: "border-red-500 bg-red-50", etiqueta: "bg-red-600", titulo: "Anulada" },
  }[estado];

  function marcar(n: number) {
    setMensaje(null);
    startTransition(async () => {
      const r = await registrarIngresoAction(entrada.id, n);
      setMensaje(
        r.ok
          ? { ok: true, texto: `Registrado: ${n === 1 ? "entra 1 persona" : `entran ${n} personas`}.` }
          : { ok: false, texto: r.error }
      );
      router.refresh();
    });
  }

  function deshacer() {
    setMensaje(null);
    startTransition(async () => {
      const r = await deshacerIngresoAction(entrada.id);
      setMensaje(
        r.ok
          ? { ok: true, texto: "Último ingreso deshecho." }
          : { ok: false, texto: r.error }
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className={cn("rounded-2xl border-2 p-5", tema.caja)}>
        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-sm font-semibold text-white",
            tema.etiqueta
          )}
        >
          {tema.titulo}
        </span>
        <p className="mt-3 text-2xl font-semibold leading-tight">{entrada.nombre}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {TIPO[entrada.tipo]} · <span className="font-mono">{entrada.codigo}</span>
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex gap-2" aria-hidden>
            {Array.from({ length: entrada.cupos }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-9 rounded-full border-2",
                  i < entrada.ingresados
                    ? "border-foreground/70 bg-foreground/70"
                    : "border-foreground/40 bg-white"
                )}
              />
            ))}
          </div>
          <p className="text-sm">
            <span className="text-2xl font-semibold tabular-nums">
              {entrada.ingresados}
            </span>{" "}
            de {entrada.cupos} ya entraron
          </p>
        </div>

        {estado === "usada" && entrada.ultimoIngresoAt && (
          <p className="mt-3 text-sm font-medium text-red-700">
            Último ingreso a las {hora(entrada.ultimoIngresoAt)}.
          </p>
        )}
        {estado === "anulada" && (
          <p className="mt-3 text-sm font-medium text-red-700">
            Esta entrada fue anulada. No dejes pasar a nadie con ella.
          </p>
        )}
      </div>

      {mensaje && (
        <p
          role="status"
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-medium",
            mensaje.ok ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
          )}
        >
          {mensaje.texto}
        </p>
      )}

      {!puedeMarcar && (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Tu usuario es de solo lectura: puedes ver el estado, pero no marcar
          ingresos. Usa una cuenta de administrador o el PIN del evento.
        </p>
      )}

      {puedeMarcar && restantes > 0 && !entrada.anulada && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            ¿Cuántas personas entran ahora?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: restantes }).map((_, i) => (
              <button
                key={i}
                type="button"
                disabled={pendiente}
                onClick={() => marcar(i + 1)}
                className="h-16 rounded-xl bg-primary text-lg font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50"
              >
                Entran {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {puedeMarcar && entrada.ingresados > 0 && (
        <button
          type="button"
          disabled={pendiente}
          onClick={deshacer}
          className="h-12 w-full rounded-xl border-2 border-foreground/30 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50"
        >
          Deshacer último ingreso
        </button>
      )}
    </div>
  );
}
