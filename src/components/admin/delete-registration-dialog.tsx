"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteRegistrationAction } from "@/server/actions/admin.actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Doble confirmación para el borrado real: primero hay que aceptar la
 * advertencia y después escribir el código de la inscripción. Son dos actos
 * distintos a propósito — un solo clic de más no debería borrar un pago.
 * El servidor vuelve a comprobar el código, así que saltarse el diálogo no
 * sirve de nada.
 */
export function DeleteDialog({
  registrationId,
  code,
  size,
  open: openExterno,
  onOpenChange,
  sinDisparador = false,
}: {
  registrationId: string;
  code: string;
  size?: "sm";
  /** Control desde fuera, para abrirlo desde un elemento de menú. */
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  sinDisparador?: boolean;
}) {
  const [openInterno, setOpenInterno] = useState(false);
  const open = openExterno ?? openInterno;
  const setOpen = onOpenChange ?? setOpenInterno;
  const [paso, setPaso] = useState<1 | 2>(1);
  const [codigo, setCodigo] = useState("");
  const [isPending, startTransition] = useTransition();

  const coincide = codigo.trim().toUpperCase() === code.toUpperCase();

  function cerrar(next: boolean) {
    setOpen(next);
    if (!next) {
      setPaso(1);
      setCodigo("");
    }
  }

  function borrar() {
    startTransition(async () => {
      const r = await deleteRegistrationAction(registrationId, codigo);
      if (r.ok) {
        toast.success(`${code} se borró definitivamente.`);
        cerrar(false);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      {!sinDisparador && (
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size={size}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Borrar
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paso === 1 ? `Borrar ${code}` : "Confirma escribiendo el código"}
          </DialogTitle>
          <DialogDescription>
            {paso === 1 ? (
              <>
                Se elimina la inscripción y, con ella, sus participantes, su
                proforma y su historial de estados. Esto no se puede deshacer.
                Si solo quieres sacarla del panel, usa Archivar: libera el cupo
                igual y se puede restaurar.
              </>
            ) : (
              <>
                Escribe <span className="font-mono font-semibold">{code}</span>{" "}
                para confirmar el borrado definitivo.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {paso === 2 && (
          <div className="space-y-2">
            <Label htmlFor={`confirm-${registrationId}`}>
              Código de la inscripción
            </Label>
            <Input
              id={`confirm-${registrationId}`}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder={code}
              autoComplete="off"
              className="font-mono"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => cerrar(false)}>
            Cancelar
          </Button>
          {paso === 1 ? (
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => setPaso(2)}
            >
              Entiendo, continuar
            </Button>
          ) : (
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={borrar}
              disabled={!coincide || isPending}
            >
              {isPending ? "Borrando…" : "Borrar definitivamente"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
