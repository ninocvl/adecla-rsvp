import { normalizeRnc } from "@/lib/validations/registration.schema";

/**
 * Lista real de patrocinadores del torneo (de "RNC PATROCINADORES.xlsx").
 * Sirve para la verificación blanda de RNC: cuando alguien dice ser
 * invitado de un patrocinador, se compara el RNC que dio contra esta lista.
 * No bloquea la inscripción si no coincide — solo queda marcada para que el
 * admin la revise a mano (ver sponsorRncVerified en Registration).
 */
// El RNC se deja tal cual está en el Excel original (con o sin guiones): la
// comparación siempre pasa por normalizeRnc(), así que el formato de aquí no
// importa — pero copiarlo literal evita errores de transcripción al
// concatenar dígitos a mano.
export const SPONSORS: { name: string; rnc?: string }[] = [
  { name: "Grupo Estrella", rnc: "102-318816" },
  // Sin RNC en el Excel de patrocinios: se elige igual, y quien se inscribe
  // escribe el RNC (queda marcado para revisión hasta que se agregue aquí).
  { name: "Mived" },
  { name: "IDEA (Idea Diseño y Supervisión SRL)", rnc: "130687161" },
  { name: "Alaver", rnc: "4-03-00063-1" },
  { name: "DOWNTOWN SOLUTIONS SERVICES YAR, SRL", rnc: "1-31-31251-9" },
  { name: "Sumo Constructora, S.R.L.", rnc: "132-14375-2" },
  { name: "Depósito Ferretero" },
];

export function findMatchingSponsor(rnc: string) {
  const target = normalizeRnc(rnc);
  return (
    SPONSORS.find((s) => s.rnc && normalizeRnc(s.rnc) === target) ?? null
  );
}
