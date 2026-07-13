"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { participantSchema } from "@/lib/validations/registration.schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ParticipantValue {
  fullName: string;
  email?: string;
  phone?: string;
}

interface StepValues {
  participants: { fullName: string; email: string; phone: string }[];
}

// Valida solo los jugadores activos: con "solo un jugador" el bloque 2 se ignora.
function makeStepSchema(soloPlayer: boolean) {
  return z.object({
    participants: z.array(z.record(z.string(), z.unknown())).superRefine((arr, ctx) => {
      const count = soloPlayer ? 1 : 2;
      for (let i = 0; i < count; i++) {
        const result = participantSchema.safeParse(arr[i]);
        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({ ...issue, path: [i, ...issue.path] });
          }
        }
      }
    }),
  });
}

interface ParticipantFormProps {
  defaultValues: ParticipantValue[];
  onBack: () => void;
  onNext: (participants: ParticipantValue[]) => void;
}

export function ParticipantForm({
  defaultValues,
  onBack,
  onNext,
}: ParticipantFormProps) {
  const [soloPlayer, setSoloPlayer] = useState(defaultValues.length === 1);
  const schema = useMemo(() => makeStepSchema(soloPlayer), [soloPlayer]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      participants: [0, 1].map((i) => ({
        fullName: defaultValues[i]?.fullName ?? "",
        email: defaultValues[i]?.email ?? "",
        phone: defaultValues[i]?.phone ?? "",
      })),
    },
  });

  function onSubmit(values: StepValues) {
    const active = soloPlayer
      ? [values.participants[0]]
      : values.participants.slice(0, 2);
    onNext(
      active.map((p) => ({
        fullName: p.fullName.trim(),
        email: p.email.trim() || undefined,
        phone: p.phone.trim() || undefined,
      }))
    );
  }

  const participantBlocks = soloPlayer ? [0] : [0, 1];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {participantBlocks.map((index) => (
        <fieldset key={index} className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">
            {index === 0 ? "Jugador 1" : "Jugador 2"}
          </legend>
          <div className="space-y-2">
            <Label htmlFor={`p${index}-name`}>Nombre completo</Label>
            <Input
              id={`p${index}-name`}
              placeholder="Nombre y apellidos"
              {...register(`participants.${index}.fullName`)}
            />
            {errors.participants?.[index]?.fullName && (
              <p className="text-sm text-destructive">
                {errors.participants[index]?.fullName?.message as string}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`p${index}-email`}>
                Correo <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id={`p${index}-email`}
                type="email"
                placeholder="jugador@correo.com"
                {...register(`participants.${index}.email`)}
              />
              {errors.participants?.[index]?.email && (
                <p className="text-sm text-destructive">
                  {errors.participants[index]?.email?.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`p${index}-phone`}>
                Teléfono{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id={`p${index}-phone`}
                type="tel"
                placeholder="809-555-0000"
                {...register(`participants.${index}.phone`)}
              />
            </div>
          </div>
        </fieldset>
      ))}

      <label className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
        <Checkbox
          checked={soloPlayer}
          onCheckedChange={(checked) => setSoloPlayer(checked === true)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">
            Por ahora inscribo un solo jugador.
          </span>{" "}
          <span className="text-muted-foreground">
            El torneo se juega por parejas; podrás completar la tuya más
            adelante.
          </span>
        </span>
      </label>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
