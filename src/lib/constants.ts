export const ADECLA = {
  nombre: "ADECLA",
  nombreLegal:
    "Asociación de Desarrolladores y Constructores Provincia La Altagracia",
  rnc: "430134309",
  direccion: [
    "Boulevar 1ro. De Noviembre",
    "Edificio Cedro, Suite 1002P",
    "Punta Cana Village, Punta Cana, Rep. Dom.",
  ],
  contacto: {
    telefono: "+1 (829) 488-8662",
    // Solo dígitos con código de país, formato que requiere el link wa.me.
    whatsapp: "18294888662",
    email: "adecla.adm@gmail.com",
  },
  banco: {
    nombre: "Banco Popular",
    tipoCuenta: "Cuenta corriente",
    numero: "782705941",
    titular: "ADECLA",
    rnc: "430134309",
  },
} as const;

export const NOTA_PAGO =
  "*Los pagos se realizan en pesos dominicanos utilizando la tasa del día.";

// ITBIS (impuesto sobre transferencia de bienes y servicios) vigente en RD.
// Se aplica sobre el subtotal de cada inscripción para llegar al total real
// a pagar — ver DESIGN.md / factura proforma.
export const ITBIS_RATE = 0.18;

// Fechas puntuales donde ADECLA decidió no cobrar ITBIS en la proforma.
// Clave "slug|YYYY-MM-DD", igual convención que event-media.ts. Una fecha
// que no aparezca aquí cobra ITBIS por defecto, que es la regla general.
const ITBIS_EXEMPT_DATE_KEYS = ["padel|2026-08-14", "golf|2026-09-05"];

export function isItbisExempt(eventSlug: string, date: Date): boolean {
  return ITBIS_EXEMPT_DATE_KEYS.includes(
    `${eventSlug}|${date.toISOString().slice(0, 10)}`
  );
}

export const AFFILIATION_LABELS: Record<string, string> = {
  CONSTRUCTOR: "Constructor",
  PROVEEDOR: "Proveedor / Entidades de apoyo",
  DESARROLLADOR: "Desarrollador",
};

// Pádel es abierto al público: no cobra por tipo de empresa como golf, sino
// una tarifa plana por participante — salvo invitados de patrocinador, que
// no pagan (ver isSponsorGuest en Registration).
export const PADEL_PRICE_USD = 50;

export const PADEL_CATEGORIES = [
  "FEMENINO_B",
  "FEMENINO_C",
  "FEMENINO_D",
  "MASCULINO_A",
  "MASCULINO_B",
  "MASCULINO_C",
] as const;

export const PADEL_CATEGORY_LABELS: Record<string, string> = {
  FEMENINO_B: "Femenina B",
  FEMENINO_C: "Femenina C",
  FEMENINO_D: "Femenina D",
  MASCULINO_A: "Masculino A",
  MASCULINO_B: "Masculino B",
  MASCULINO_C: "Masculino C",
};

// Clubes de pádel con convenio: sus miembros pagan la tarifa con descuento
// en vez de la plana. No es lo mismo que un invitado de patrocinador: aquí
// sí se cobra (con descuento) y sí se genera proforma.
export const PADEL_CLUBS = ["LA_PENA", "VIEJEVOS"] as const;

export const PADEL_CLUB_LABELS: Record<string, string> = {
  LA_PENA: "La Peña",
  VIEJEVOS: "Viejevos",
};

export const PADEL_CLUB_DISCOUNT_RATE = 0.2;

// Etiqueta de categoría sin importar el evento: golf usa affiliation
// (Constructor/Proveedor/Desarrollador), pádel usa padelCategory
// (género + nivel). Nunca hay los dos a la vez en una misma inscripción.
// padelClub es aparte: se puede combinar con padelCategory (juega en tal
// categoría Y es socio de tal club), así que se agrega como sufijo.
export function getCategoryLabel(
  affiliation?: string | null,
  padelCategory?: string | null,
  padelClub?: string | null
): string {
  const base = padelCategory
    ? (PADEL_CATEGORY_LABELS[padelCategory] ?? padelCategory)
    : affiliation
      ? (AFFILIATION_LABELS[affiliation] ?? affiliation)
      : "—";
  if (!padelClub) return base;
  const clubLabel = PADEL_CLUB_LABELS[padelClub] ?? padelClub;
  return `${base} · Club ${clubLabel} (${PADEL_CLUB_DISCOUNT_RATE * 100}% dto.)`;
}

export const STATUS_LABELS: Record<string, string> = {
  PROFORMA_GENERADA: "Proforma generada",
  PENDIENTE_PAGO: "Pendiente de pago",
  EN_REVISION: "En revisión",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};
