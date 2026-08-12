const usdFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dopFormatter = new Intl.NumberFormat("es-DO", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number | string): string {
  return usdFormatter.format(Number(amount));
}

export function formatDop(amount: number | string): string {
  return `RD$${dopFormatter.format(Number(amount))}`;
}

// Las fechas de evento se guardan a las 12:00 UTC; se formatean en UTC
// para que muestren el mismo día en cualquier zona horaria.
export function formatEventDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/**
 * "14 y 15 de agosto de 2026" cuando el torneo dura dos días, y la fecha
 * suelta cuando dura uno. Se evita el guion tipográfico porque esto se lee
 * en voz alta por teléfono tan a menudo como en pantalla.
 */
export function formatEventDateRange(
  date: Date | string,
  endDate?: Date | string | null
): string {
  if (!endDate) return formatEventDate(date);

  const inicio = new Date(date);
  const fin = new Date(endDate);
  const mismoMes =
    inicio.getUTCFullYear() === fin.getUTCFullYear() &&
    inicio.getUTCMonth() === fin.getUTCMonth();

  if (!mismoMes) return `${formatEventDate(inicio)} al ${formatEventDate(fin)}`;

  // Mismo mes: no hace falta repetirlo. "14 y 15 de agosto de 2026".
  const resto = new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(fin);
  return `${inicio.getUTCDate()} y ${resto}`;
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatIssuedDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santo_Domingo",
  }).format(new Date(date));
}
