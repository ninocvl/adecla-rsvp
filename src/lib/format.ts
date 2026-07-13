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
