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
export const SPONSORS: { name: string; rnc: string }[] = [
  { name: "Cobatesa", rnc: "133720272" },
  { name: "Vemp Desing Solutions", rnc: "132-136-063" },
  { name: "LCI Distributors Dominicana SRL", rnc: "131527231" },
  { name: "Systemio SRL", rnc: "132183533" },
  { name: "Grupo Estrella", rnc: "102-318816" },
  { name: "Horizon Consultants", rnc: "124006392" },
  { name: "Suplementos Industriales Punta Cana, S.R.L.", rnc: "130321108" },
  { name: "Gemsa", rnc: "130389209" },
  { name: "Picky Plants SRL", rnc: "1-24-02299-1" },
  { name: "Metalsider", rnc: "1-32-11355-1" },
  { name: "Banco Múltiple Vimenca", rnc: "101021411" },
  { name: "Nardi", rnc: "130362483" },
];

export function findMatchingSponsor(rnc: string) {
  const target = normalizeRnc(rnc);
  return SPONSORS.find((s) => normalizeRnc(s.rnc) === target) ?? null;
}
