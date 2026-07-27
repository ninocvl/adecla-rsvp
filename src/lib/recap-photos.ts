// Fotos reales de cada parada ya jugada. La clave es "eventSlug|YYYY-MM-DD"
// en vez del id de EventDate: el id lo genera cada entorno (local/prod) al
// sembrar, pero la fecha del torneo es el dato estable que no cambia.
const RECAP_PHOTOS: Record<string, string[]> = {
  "golf|2026-07-25": Array.from(
    { length: 16 },
    (_, i) => `/images/recap-golf-25jul-${String(i + 1).padStart(2, "0")}.jpg`
  ),
};

export function getRecapPhotos(eventSlug: string, date: Date): string[] {
  const key = `${eventSlug}|${date.toISOString().slice(0, 10)}`;
  return RECAP_PHOTOS[key] ?? [];
}
