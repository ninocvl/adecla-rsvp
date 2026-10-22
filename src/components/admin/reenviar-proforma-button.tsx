"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reenviarProformaAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";

export function ReenviarProformaButton({
  registrationId,
  email,
}: {
  registrationId: string;
  email: string;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  function reenviar() {
    startTransition(async () => {
      const r = await reenviarProformaAction(registrationId);
      if (r.ok) toast.success(`Proforma enviada a ${email}.`);
      else toast.error(r.error);
      router.refresh();
    });
  }

  return (
    <Button variant="outline" disabled={pendiente} onClick={reenviar}>
      {pendiente ? "Enviando…" : "Reenviar correo"}
    </Button>
  );
}
