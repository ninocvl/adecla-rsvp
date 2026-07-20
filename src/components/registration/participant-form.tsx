"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { participantSchema } from "@/lib/validations/registration.schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

// Valida solo los jugadores activos: con 1 participante el bloque 2 se ignora.
function makeStepSchema(count: number) {
  return z.object({
    participants: z.array(z.record(z.string(), z.unknown())).superRefine((arr, ctx) => {
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
  count: 1 | 2 | undefined;
  onCountChange: (count: 1 | 2 | undefined) => void;
  onBack: () => void;
  onNext: (participants: ParticipantValue[]) => void;
}

export function ParticipantForm({
  defaultValues,
  count,
  onCountChange,
  onBack,
  onNext,
}: ParticipantFormProps) {
  const schema = useMemo(() => makeStepSchema(count ?? 1), [count]);

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
    const active = values.participants.slice(0, count ?? 1);
    onNext(
      active.map((p) => ({
        fullName: p.fullName.trim(),
        email: p.email.trim() || undefined,
        phone: p.phone.trim() || undefined,
      }))
    );
  }

  if (count === undefined) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>¿Cuántos participantes vas a inscribir?</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onCountChange(1)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                "hover:border-primary/40"
              )}
            >
              1 participante
            </button>
            <button
              type="button"
              onClick={() => onCountChange(2)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                "hover:border-primary/40"
              )}
            >
              2 participantes
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            El torneo se juega por parejas; si todavía no tienes compañero,
            puedes inscribir un solo jugador y completar tu pareja más
            adelante.
          </p>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
        </div>
      </div>
    );
  }

  const participantBlocks = count === 1 ? [0] : [0, 1];

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

      <button
        type="button"
        onClick={() => onCountChange(undefined)}
        className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Cambiar número de participantes
      </button>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
