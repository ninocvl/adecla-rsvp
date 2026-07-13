import { z } from "zod";
import { isValidDominicanTaxId } from "./dominican-id";

export const loginSchema = z.object({
  email: z.email("Escribe un correo válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const rncFormatRegex = /^\d{1}-?\d{2}-?\d{5}-?\d{1}$|^\d{9}$|^\d{11}$/;

export const AFFILIATION_TYPES = [
  "CONSTRUCTOR",
  "PROVEEDOR",
  "DESARROLLADOR",
] as const;

export const registerCompanySchema = z
  .object({
    legalName: z
      .string()
      .min(3, "Escribe la razón social completa")
      .max(150, "Máximo 150 caracteres"),
    rnc: z
      .string()
      .trim()
      .regex(rncFormatRegex, "El RNC debe tener 9 dígitos (o cédula de 11)")
      .refine(isValidDominicanTaxId, {
        message: "Ese RNC o cédula no es válido — revisa los dígitos",
      }),
    affiliationType: z.enum(AFFILIATION_TYPES, "Selecciona el tipo de empresa"),
    contactName: z
      .string()
      .min(3, "Escribe el nombre del contacto")
      .max(100, "Máximo 100 caracteres"),
    email: z.email("Escribe un correo válido"),
    phone: z
      .string()
      .min(10, "Escribe un teléfono válido")
      .max(20, "Máximo 20 caracteres"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;

export function normalizeRnc(rnc: string): string {
  return rnc.replace(/-/g, "");
}
