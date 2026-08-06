/**
 * Contenido editorial de la página de detalle de cada evento: el gancho, la
 * descripción larga, el horario, qué incluye y las fotos de la galería.
 *
 * Vive en código por la misma razón que event-media.ts: la base de datos solo
 * se llena al correr el seed, así que cualquier texto puesto ahí se
 * desincroniza entre local y producción. Aquí se despliega con el sitio.
 *
 * Los campos opcionales (horario, incluye, galeria) se omiten en la página si
 * no están: es preferible una sección menos que un bloque inventado.
 */

export interface EventDetail {
  /** Frase corta bajo la fecha en la portada. */
  gancho: string;
  /** Descripción larga; cada string es un párrafo. */
  descripcion: string[];
  /** Foto de fondo de la portada. Si falta, se usa el flyer de la tarjeta. */
  portada?: string;
  /** Encuadre de la foto de portada (object-position). */
  portadaPosicion?: string;
  /** Bloques de horario, uno por día. */
  horario?: { dia: string; filas: { hora: string; que: string }[] }[];
  /** Qué incluye la inscripción. */
  incluye?: string[];
  /** Resumen de "Incluye" para la tarjeta lateral, en una sola frase. */
  incluyeResumen?: string;
  /** Fotos de la tira bajo la descripción. */
  galeria?: string[];
}

// Misma clave que event-media.ts: "slug|YYYY-MM-DD".
const DETALLES: Record<string, EventDetail> = {
  "padel|2026-08-14": {
    gancho:
      "Networking, deporte y relaciones empresariales en un solo evento.",
    descripcion: [
      "El Torneo de Pádel ADECLA 2026 reúne a líderes y profesionales del sector construcción e inmobiliario en un torneo abierto al público, pensado para fortalecer relaciones y generar oportunidades mientras se juega.",
      "Se juega en parejas del mismo género y categoría, en Los Establos Sports Complex, Cap Cana. Si todavía no tienes compañero, puedes inscribirte solo y completar tu pareja más adelante.",
    ],
  },
  "golf|2026-09-05": {
    gancho:
      "Una jornada de golf donde el sector construcción se encuentra fuera de la oficina.",
    descripcion: [
      "La tercera parada del ADECLA Golf Tour 2026 se juega en La Cana Golf Club, Punta Cana Resort, uno de los campos más prestigiosos del Caribe, reconocido por su diseño, su nivel competitivo y sus vistas al mar.",
      "Reúne a constructores, desarrolladores, proveedores y aliados estratégicos del sector en una jornada que combina competencia deportiva, relacionamiento empresarial y networking.",
      "Se juega en parejas. Si aún no tienes compañero, puedes inscribirte de manera individual y completar tu pareja posteriormente.",
    ],
  },
  "golf|2026-07-25": {
    gancho:
      "La primera parada del circuito, jugada en Punta Espada Golf Club.",
    descripcion: [
      "La primera parada del ADECLA Golf Tour 2026 se jugó en Punta Espada Golf Club, Cap Cana, uno de los campos más prestigiosos del Caribe por su diseño y sus vistas al mar.",
      "Reunió a constructores, desarrolladores, proveedores y aliados estratégicos del sector en una jornada que combinó competencia deportiva, relacionamiento empresarial y networking.",
    ],
    // Las 16 fotos del recuento ya viven en event-media.ts; la galería del
    // detalle toma las primeras cuatro de ahí.
  },
};

export function getEventDetail(
  eventSlug: string,
  date: Date
): EventDetail | null {
  const key = `${eventSlug}|${date.toISOString().slice(0, 10)}`;
  return DETALLES[key] ?? null;
}
