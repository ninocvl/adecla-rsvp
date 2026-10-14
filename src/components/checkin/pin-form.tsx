"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { entrarConPinAction } from "@/server/actions/checkin.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PinForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await entrarConPinAction(pin);
      if (r.ok) router.refresh();
      else setError(r.error);
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Label htmlFor="pin">PIN del evento</Label>
      <Input
        id="pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="h-12 text-lg"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pendiente || !pin}
        className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-50"
      >
        Entrar como staff
      </button>
    </form>
  );
}
