/**
 * Toda la imaginería de los eventos (flyer de portada y fotos del recap) vive
 * aquí, en código, y no en la base de datos.
 *
 * El motivo: el campo `imageUrl` de Event/EventDate solo se llena al correr
 * `prisma db seed`, así que cada entorno terminaba con un valor distinto — la
 * base local (efímera, se recrea al reiniciar `prisma dev`) y la de producción
 * en Neon nunca coincidían, y cambiar una imagen en el seed no llegaba a
 * producción sin volver a sembrar. Al vivir en código se despliega junto con
 * el resto del sitio y se ve igual en todas partes.
 *
 * Para cambiar la foto de un evento, edita este archivo. No hace falta tocar
 * la base de datos ni correr el seed.
 */

interface EventMedia {
  /** Flyer de portada de la tarjeta en la landing. */
  cover: string;
  /** Fotos del torneo ya jugado. Ausente mientras no se haya jugado. */
  recap?: string[];
}

function recapSeries(prefix: string, count: number) {
  return Array.from(
    { length: count },
    (_, i) => `/images/${prefix}-${String(i + 1).padStart(2, "0")}.jpg`
  );
}

// Clave: "slug|YYYY-MM-DD" para una parada con fecha (cada parada tiene su
// propio flyer), o solo "slug" para un evento que aún no tiene fechas.
const MEDIA: Record<string, EventMedia> = {
  "golf|2026-07-25": {
    cover: "/images/golf-25-julio.jpg",
    recap: recapSeries("recap-golf-25jul", 16),
  },
  "golf|2026-09-05": {
    cover: "/images/golf-05-septiembre.jpg",
  },
  padel: {
    cover: "/images/padel-proximamente.jpg",
  },
};

function keyFor(eventSlug: string, date?: Date) {
  return date ? `${eventSlug}|${date.toISOString().slice(0, 10)}` : eventSlug;
}

export function getEventCover(eventSlug: string, date?: Date): string | null {
  return MEDIA[keyFor(eventSlug, date)]?.cover ?? null;
}

export function getRecapPhotos(eventSlug: string, date: Date): string[] {
  return MEDIA[keyFor(eventSlug, date)]?.recap ?? [];
}
