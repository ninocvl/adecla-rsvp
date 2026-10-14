"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  anularEntradaAction,
  reenviarEntradaAction,
} from "@/server/actions/entradas.actions";
import { Button } from "@/components/ui/button";

export function EntradaAcciones({
  id,
  anulada,
  puedeEditar,
}: {
  id: string;
  anulada: boolean;
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);

  function reenviar() {
    setMensaje(null);
    startTransition(async () => {
      const r = await reenviarEntradaAction(id);
      setMensaje(r.ok ? "Correo enviado." : r.error);
      router.refresh();
    });
  }

  function anular() {
    if (!confirm("¿Anular esta entrada? Dejará de ser válida en la puerta.")) return;
    startTransition(async () => {
      const r = await anularEntradaAction(id);
      if (!r.ok) setMensaje(r.error ?? "No se pudo anular.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<a href={`/admin/entradas/${id}/pdf`} target="_blank" rel="noopener" />}
        >
          PDF
        </Button>
        {puedeEditar && !anulada && (
          <>
            <Button size="sm" variant="outline" disabled={pendiente} onClick={reenviar}>
              Reenviar correo
            </Button>
            <Button size="sm" variant="outline" disabled={pendiente} onClick={anular}>
              Anular
            </Button>
          </>
        )}
      </div>
      {mensaje && <p className="text-xs text-muted-foreground">{mensaje}</p>}
    </div>
  );
}
