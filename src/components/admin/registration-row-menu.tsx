"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  archiveRegistrationAction,
  restoreRegistrationAction,
} from "@/server/actions/admin.actions";
import { DeleteDialog } from "./delete-registration-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Props {
  registrationId: string;
  code: string;
  archivada: boolean;
}

/**
 * Las acciones de cada fila, plegadas.
 *
 * Antes había cinco controles por fila (ver, cambiar estado, archivar,
 * borrar, proforma) repetidos en cada una de las cincuenta y siete: la
 * tabla se leía como una pared de botones. Quedan fuera los dos de uso
 * diario y aquí dentro el resto, con el borrado separado por una línea
 * porque no se deshace.
 */
export function RegistrationRowMenu({
  registrationId,
  code,
  archivada,
}: Props) {
  const [borrarAbierto, setBorrarAbierto] = useState(false);
  const [isPending, startTransition] = useTransition();

  function archivar() {
    startTransition(async () => {
      const r = await archiveRegistrationAction(registrationId);
      if (r.ok) toast.success(`${code} archivada. Liberó sus cupos.`);
      else toast.error(r.error);
    });
  }

  function restaurar() {
    startTransition(async () => {
      const r = await restoreRegistrationAction(registrationId);
      if (r.ok) toast.success(`${code} restaurada.`);
      else toast.error(r.error);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          aria-label={`Más acciones para ${code}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
            <circle cx="8" cy="3" r="1.4" />
            <circle cx="8" cy="8" r="1.4" />
            <circle cx="8" cy="13" r="1.4" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            render={
              <a
                href={`/api/proformas/${registrationId}/pdf`}
                target="_blank"
                rel="noopener"
              />
            }
            className="px-2 py-1.5"
          >
            Ver proforma
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={archivada ? restaurar : archivar}
            className="px-2 py-1.5"
          >
            {archivada ? "Restaurar" : "Archivar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            // El diálogo se abre después de que el menú termine de cerrarse:
            // si se abren a la vez, el menú se lleva el foco al desmontarse.
            onClick={() => setTimeout(() => setBorrarAbierto(true), 0)}
            className="px-2 py-1.5"
          >
            Borrar…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        registrationId={registrationId}
        code={code}
        open={borrarAbierto}
        onOpenChange={setBorrarAbierto}
        sinDisparador
      />
    </>
  );
}
