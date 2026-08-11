"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  cambiarCategoriaAction,
  type CambiarCategoriaInput,
} from "@/server/actions/admin.actions";
import { PADEL_CATEGORIES, PADEL_CATEGORY_LABELS } from "@/lib/constants";
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

type PadelCategory = CambiarCategoriaInput["padelCategory"];

interface CategoriaChangeDialogProps {
  registrationId: string;
  code: string;
  currentCategory: PadelCategory;
}

export function CategoriaChangeDialog({
  registrationId,
  code,
  currentCategory,
}: CategoriaChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoria, setCategoria] = useState<PadelCategory>(currentCategory);
  const [isPending, startTransition] = useTransition();

  function submit() {
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
