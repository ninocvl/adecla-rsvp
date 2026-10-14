/**
 * Entradas con QR. Todo lo que no depende de la base ni de React vive aquí
 * para que el PDF, el correo, el check-in y el panel hablen del mismo código.
 */

// A-Z sin I ni O, y 2-9 (sin 0 ni 1): 32 símbolos, así que un byte & 31 no
// sesga la elección, y nadie confunde una O con un 0 al dictarlo.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ENTRADA_CODIGO_LARGO = 8;
export const ENTRADA_CUPOS_MAX = 3;

export function generarCodigoEntrada(): string {
  // Web Crypto (no node:crypto) para que este archivo también pueda
  // importarse desde el navegador sin arrastrar módulos de Node.
  const bytes = globalThis.crypto.getRandomValues(
    new Uint8Array(ENTRADA_CODIGO_LARGO)
  );
  let codigo = "";
  for (const byte of bytes) codigo += ALFABETO[byte & 31];
  return codigo;
}

/** ABCD2345 → ABCD-2345. */
export function formatearCodigo(codigo: string): string {
  return `${codigo.slice(0, 4)}-${codigo.slice(4)}`;
}

/**
 * Lo que escribe una persona (o lee el escáner) → el id guardado. Acepta
 * minúsculas, guion, espacios y hasta la URL completa del QR.
 */
export function normalizarCodigo(entrada: string): string | null {
  const ultimo = entrada.trim().split(/[/?#]/).filter(Boolean).pop() ?? "";
  const limpio = ultimo.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (limpio.length !== ENTRADA_CODIGO_LARGO) return null;
  for (const c of limpio) if (!ALFABETO.includes(c)) return null;
  return limpio;
}

export function baseUrl(): string {
  const url =
    process.env.BASE_URL ?? process.env.AUTH_URL ?? "https://adecla-rsvp.vercel.app";
  return url.replace(/\/+$/, "");
}

export function urlCheckin(codigo: string): string {
  return `${baseUrl()}/checkin/${codigo}`;
}

export const ENTRADA_TIPO_LABELS: Record<string, string> = {
  AFILIADO: "Afiliado",
  EXTERNO: "Invitado externo",
};

export type EstadoEntrada = "anulada" | "sin_usar" | "parcial" | "completa";

export function estadoEntrada(e: {
  anulada: boolean;
  cupos: number;
  ingresados: number;
}): EstadoEntrada {
  if (e.anulada) return "anulada";
  if (e.ingresados <= 0) return "sin_usar";
  if (e.ingresados >= e.cupos) return "completa";
  return "parcial";
}

export const ESTADO_ENTRADA_LABELS: Record<EstadoEntrada, string> = {
  sin_usar: "Sin usar",
  parcial: "Parcial",
  completa: "Completa",
  anulada: "Anulada",
};

/** Datos del conversatorio que salen en el correo y el PDF. */
export const CONVERSATORIO = {
  slug: "conversatorio",
  nombre: "Conversatorio ADECLA",
  titulo: "Agenda de Vivienda y Construcción para Punta Cana",
  invitado: "Jean Luis Rodríguez",
  cargo: "Ministro de Vivienda y Edificaciones (MIVED)",
  fecha: "7 de octubre de 2026",
  fechaISO: "2026-10-07",
  horario: "11:30 a. m. – 2:30 p. m.",
  lugar: "SBG Blue Mall, Punta Cana",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=SBG+Blue+Mall+Punta+Cana",
  flyer: "/images/conversatorio-flyer.jpg",
} as const;

export function slugNombre(nombre: string): string {
  return (
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "titular"
  );
}

export function nombreArchivoEntrada(nombre: string, codigo: string): string {
  return `entrada-${slugNombre(nombre)}-${codigo.slice(0, 4).toLowerCase()}.pdf`;
}
