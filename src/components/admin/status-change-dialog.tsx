"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  changeRegistrationStatusAction,
  type ChangeStatusInput,
} from "@/server/actions/admin.actions";
import { STATUS_LABELS } from "@/lib/constants";
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
import { Textarea } from "@/components/ui/textarea";

const STATUSES = Object.keys(STATUS_LABELS) as ChangeStatusInput["toStatus"][];

interface StatusChangeDialogProps {
  registrationId: string;
  code: string;
  currentStatus: string;
}

export function StatusChangeDialog({
  registrationId,
  code,
  currentStatus,
}: StatusChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [toStatus, setToStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await changeRegistrationStatusAction({
        registrationId,
        toStatus: toStatus as ChangeStatusInput["toStatus"],
        note,
      });
      if (result.ok) {
        toast.success(`${code} ahora está: ${STATUS_LABELS[toStatus]}`);
        setOpen(false);
        setNote("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Cambiar estado
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado de {code}</DialogTitle>
          <DialogDescription>
            Estado actual: {STATUS_LABELS[currentStatus] ?? currentStatus}. Al
            cancelar se liberan los cupos de la fecha.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`status-${registrationId}`}>Nuevo estado</Label>
            <select
              id={`status-${registrationId}`}
              value={toStatus}
              onChange={(e) => setToStatus(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`note-${registrationId}`}>
              Nota <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id={`note-${registrationId}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej.: pago recibido por transferencia"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={isPending || toStatus === currentStatus}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
