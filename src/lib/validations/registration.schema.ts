import { z } from "zod";

export const AFFILIATIONS = [
  "CONSTRUCTOR",
  "PROVEEDOR",
  "DESARROLLADOR",
] as const;

export const PADEL_CATEGORIES = [
  "FEMENINO_B",
  "FEMENINO_C",
  "FEMENINO_D",
  "MASCULINO_B",
  "MASCULINO_C",
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
// sesión de por medio. eventSlug decide qué preguntas del paso "Empresa"
// aplican: golf pregunta por membresía ADECLA (isAffiliated + afiliación),
// pádel pregunta si es invitado de un patrocinador (isSponsorGuest) y su
// categoría (padelCategory) — nunca las dos cosas a la vez. El servidor
// vuelve a leer el evento real por eventId antes de confiar en esto: el
// eventSlug de aquí solo determina qué validar en el formulario.
const companyFieldsSchema = z.object({
  eventSlug: z.string().min(1),

  // --- Golf: membresía ADECLA ---
  isAffiliated: z.boolean().optional(),
  // Presente solo cuando isAffiliated=true y se eligió una empresa del listado.
  affiliateId: z.string().optional(),
  // Presente solo cuando isAffiliated=false: pide contactarla para afiliarla.
  wantsToAffiliate: z.boolean().optional(),
  affiliationType: z.enum(AFFILIATIONS).optional(),

  // --- Pádel: invitado de patrocinador + categoría ---
  isSponsorGuest: z.boolean().optional(),
  sponsorName: z
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .optional(),
  sponsorRnc: z.string().trim().optional(),
  padelCategory: z.enum(PADEL_CATEGORIES).optional(),

  // --- Comunes a cualquier evento ---
  legalName: z
    .string()
    .min(3, "Escribe la razón social completa")
    .max(150, "Máximo 150 caracteres"),
  rnc: z
    .string()
    .trim()
    .regex(rncFormatRegex, "El RNC debe tener 9 dígitos (o cédula de 11)"),
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

function validateCompanyFields(
  data: z.infer<typeof companyFieldsSchema>,
  ctx: z.RefinementCtx
) {
  if (data.eventSlug === "padel") {
    if (data.isSponsorGuest === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Indica si te invita un patrocinador.",
        path: ["isSponsorGuest"],
      });
    }
    if (data.padelCategory === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona tu categoría.",
        path: ["padelCategory"],
      });
    }
    if (data.isSponsorGuest) {
      if (!data.sponsorName || data.sponsorName.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Escribe el nombre del patrocinador.",
          path: ["sponsorName"],
        });
      }
      if (!data.sponsorRnc || !rncFormatRegex.test(data.sponsorRnc)) {
        ctx.addIssue({
          code: "custom",
          message: "El RNC del patrocinador debe tener 9 dígitos.",
          path: ["sponsorRnc"],
        });
      }
    }
    return;
  }

  if (data.isAffiliated === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "Indica si tu empresa ya es miembro de ADECLA.",
      path: ["isAffiliated"],
    });
  }
  if (data.isAffiliated && !data.affiliateId) {
    ctx.addIssue({
      code: "custom",
      message: "Selecciona tu empresa de la lista",
      path: ["affiliateId"],
    });
  }
  if (!data.affiliationType) {
    ctx.addIssue({
      code: "custom",
      message: "Selecciona el tipo de empresa",
      path: ["affiliationType"],
    });
  }
}

// Paso "Empresa" del wizard: se valida solo, antes de avanzar al resto.
export const companyStepSchema = companyFieldsSchema.superRefine(
  validateCompanyFields
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
  .superRefine(validateCompanyFields);

export type CreateRegistrationInput = z.input<typeof createRegistrationSchema>;
