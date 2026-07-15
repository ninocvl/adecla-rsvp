import { z } from "zod";

export const AFFILIATIONS = [
  "CONSTRUCTOR",
  "PROVEEDOR",
  "DESARROLLADOR",
] as const;

// Solo se valida el formato (dígitos, largo razonable). El dígito verificador
// no se comprueba: lo revisa manualmente el administrador, para no bloquear
// registros por un algoritmo que no podemos contrastar contra la DGII.
const rncFormatRegex = /^\d{1}-?\d{2}-?\d{5}-?\d{1}$|^\d{9}$|^\d{11}$/;

export function normalizeRnc(rnc: string): string {
  return rnc.replace(/-/g, "");
}

export const participantSchema = z.object({
  fullName: z
    .string()
    .min(3, "Escribe el nombre completo")
    .max(120, "Máximo 120 caracteres"),
  email: z
    .union([z.email("Escribe un correo válido"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  phone: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type ParticipantInput = z.input<typeof participantSchema>;

// Formulario del paso de participantes (jugador 2 opcional).
export const participantsStepSchema = z.object({
  participants: z
    .array(participantSchema)
    .min(1, "Registra al menos un participante")
    .max(2, "Máximo dos participantes por inscripción"),
});

export type ParticipantsStepInput = z.input<typeof participantsStepSchema>;

// Empresa e inscripción viajan juntas en un solo envío: no hay cuenta ni
// sesión de por medio. La afiliación (tipo de tarifa) sí la manda el
// cliente aquí, pero el servidor siempre relee el precio real desde
// EventPrice — nunca confía en un monto calculado en el navegador.
const companyFieldsSchema = z.object({
  isAffiliated: z.boolean(),
  // Presente solo cuando isAffiliated=true y se eligió una empresa del listado.
  affiliateId: z.string().optional(),
  // Presente solo cuando isAffiliated=false: pide contactarla para afiliarla.
  wantsToAffiliate: z.boolean(),
  legalName: z
    .string()
    .min(3, "Escribe la razón social completa")
    .max(150, "Máximo 150 caracteres"),
  rnc: z
    .string()
    .trim()
    .regex(rncFormatRegex, "El RNC debe tener 9 dígitos (o cédula de 11)"),
  affiliationType: z.enum(AFFILIATIONS, "Selecciona el tipo de empresa"),
  contactName: z
    .string()
    .min(3, "Escribe el nombre del contacto")
    .max(100, "Máximo 100 caracteres"),
  email: z.email("Escribe un correo válido"),
  phone: z
    .string()
    .min(10, "Escribe un teléfono válido")
    .max(20, "Máximo 20 caracteres"),
});

function requiresAffiliateSelection(data: { isAffiliated: boolean; affiliateId?: string }) {
  return !data.isAffiliated || !!data.affiliateId;
}
const affiliateRefineOptions = {
  message: "Selecciona tu empresa de la lista",
  path: ["affiliateId"],
};

// Paso "Empresa" del wizard: se valida solo, antes de avanzar al resto.
export const companyStepSchema = companyFieldsSchema.refine(
  requiresAffiliateSelection,
  affiliateRefineOptions
);
export type CompanyStepInput = z.input<typeof companyStepSchema>;

export const createRegistrationSchema = companyFieldsSchema
  .extend({
    eventId: z.string().min(1, "Selecciona un evento"),
    // Los mismos participantes se inscriben en todas las fechas elegidas:
    // una empresa puede jugar la primera y la tercera parada en un solo envío.
    eventDateIds: z
      .array(z.string())
      .min(1, "Selecciona al menos una fecha"),
    participants: z
      .array(participantSchema)
      .min(1, "Registra al menos un participante")
      .max(2, "Máximo dos participantes por inscripción"),
  })
  .refine(requiresAffiliateSelection, affiliateRefineOptions);

export type CreateRegistrationInput = z.input<typeof createRegistrationSchema>;
