"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerCompanyAction } from "@/server/actions/auth.actions";
import {
  registerCompanySchema,
  type RegisterCompanyInput,
} from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

interface FieldProps {
  id: keyof RegisterCompanyInput;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

const fields: FieldProps[] = [
  {
    id: "legalName",
    label: "Razón social",
    placeholder: "Constructora Ejemplo, S.R.L.",
    autoComplete: "organization",
  },
  { id: "rnc", label: "RNC", placeholder: "1-30-12345-6" },
  {
    id: "contactName",
    label: "Nombre del contacto",
    placeholder: "Juan Pérez",
    autoComplete: "name",
  },
  {
    id: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "empresa@ejemplo.com",
    autoComplete: "email",
  },
  {
    id: "phone",
    label: "Teléfono",
    type: "tel",
    placeholder: "809-555-0000",
    autoComplete: "tel",
  },
  {
    id: "password",
    label: "Contraseña",
    type: "password",
    autoComplete: "new-password",
  },
  {
    id: "confirmPassword",
    label: "Confirmar contraseña",
    type: "password",
    autoComplete: "new-password",
  },
];

export function CompanyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCompanyInput>({
    resolver: zodResolver(registerCompanySchema),
  });

  function onSubmit(data: RegisterCompanyInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await registerCompanyAction(data);
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Registra tu empresa</CardTitle>
        <CardDescription>
          Crea la cuenta de tu empresa para inscribirte en los eventos de
          ADECLA.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <Alert variant="destructive" role="alert">
              {serverError}
            </Alert>
          )}
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                {...register(field.id)}
              />
              {errors[field.id] && (
                <p className="text-sm text-destructive">
                  {errors[field.id]?.message}
                </p>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
