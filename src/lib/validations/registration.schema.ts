import { z } from "zod";

export const AFFILIATIONS = [
  "CONSTRUCTOR",
  "PROVEEDOR",
  "DESARROLLADOR",
] as const;

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

// La afiliación NO viaja desde el cliente: el servidor la toma de
// company.affiliationType (fijada al registrar la empresa), para que nadie
// pueda enviar una categoría más barata que la de su propia empresa.
export const createRegistrationSchema = z.object({
  eventId: z.string().min(1, "Selecciona un evento"),
  eventDateId: z.string().min(1, "Selecciona una fecha"),
  participants: z
    .array(participantSchema)
    .min(1, "Registra al menos un participante")
    .max(2, "Máximo dos participantes por inscripción"),
});

export type CreateRegistrationInput = z.input<
  typeof createRegistrationSchema
>;

// Formulario del paso de participantes (jugador 2 opcional).
export const participantsStepSchema = z.object({
  participants: z
    .array(participantSchema)
    .min(1, "Registra al menos un participante")
    .max(2, "Máximo dos participantes por inscripción"),
});

export type ParticipantsStepInput = z.input<typeof participantsStepSchema>;
