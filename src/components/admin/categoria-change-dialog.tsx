"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  cambiarCategoriaAction,
  type CambiarCategoriaInput,
} from "@/server/actions/admin.actions";
import { PADEL_CATEGORIES, PADEL_CATEGORY_LABELS } from "@/lib/constants";
import type { PadelCategory } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CategoriaElegible = CambiarCategoriaInput["padelCategory"];

interface CategoriaChangeDialogProps {
  registrationId: string;
  code: string;
  /**
   * La que tiene guardada, que puede ser una categoría ya retirada del
   * torneo (Femenina D). Se acepta para poder abrir el diálogo y moverla;
   * lo que no se puede es volver a elegirla.
   */
  currentCategory: PadelCategory;
}

export function CategoriaChangeDialog({
  registrationId,
  code,
  currentCategory,
}: CategoriaChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoria, setCategoria] = useState<CategoriaElegible | undefined>(
    PADEL_CATEGORIES.includes(currentCategory as CategoriaElegible)
      ? (currentCategory as CategoriaElegible)
      : undefined
  );
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!categoria) return;
    startTransition(async () => {
      const r = await cambiarCategoriaAction({
        registrationId,
        padelCategory: categoria,
      });
      if (r.ok) {
        toast.success(
          `${code} ahora juega en ${PADEL_CATEGORY_LABELS[categoria]}.`
        );
        setOpen(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Cambiar categoría
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar categoría de {code}</DialogTitle>
          <DialogDescription>
            Mueve al jugador de categoría sin tocar su cupo, su número de
            inscripción ni lo que paga. La proforma emitida sigue valiendo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <div className="grid grid-cols-2 gap-2">
            {PADEL_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                aria-pressed={categoria === c}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  categoria === c
                    ? "border-primary bg-secondary/60 font-medium"
                    : "hover:border-primary/40"
                )}
              >
                {PADEL_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={isPending || categoria === currentCategory}
          >
            {isPending ? "Guardando…" : "Guardar categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
