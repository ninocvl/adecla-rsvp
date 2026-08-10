"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { generarCuponesFaltantesAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";

// Solo genera los que faltan, así que se puede pulsar sin miedo cuando entren
// socios nuevos: no reemplaza ni reasigna los códigos ya repartidos.
export function GenerarCuponesButton({ pendientes }: { pendientes: number }) {
  const [isPending, startTransition] = useTransition();

  function generar() {
    startTransition(async () => {
      const r = await generarCuponesFaltantesAction();
      if (r.ok) {
        toast.success(
          r.creados === 1
            ? "Se generó 1 cupón."
            : `Se generaron ${r.creados} cupones.`
        );
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <Button onClick={generar} disabled={isPending}>
      {isPending ? "Generando…" : `Generar ${pendientes} cupón(es)`}
    </Button>
  );
}
