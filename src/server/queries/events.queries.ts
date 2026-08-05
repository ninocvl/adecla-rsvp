import { prisma } from "@/lib/prisma";
import {
  getEventCover,
  getEventCoverPosition,
  getRecapPhotos,
} from "@/lib/event-media";

export interface LandingEventDate {
  id: string;
  date: Date;
  label: string;
  venue: string;
  imageUrl: string | null;
  capacity: number;
  available: number;
}

export interface LandingPriceTier {
  affiliation: "CONSTRUCTOR" | "PROVEEDOR" | "DESARROLLADOR";
  amountUsd: number;
}

// Cada tarjeta de la landing es UNA fecha (una "parada"), no un evento con
// varias fechas agrupadas — así cada parada tiene su propio flyer, cupos y CTA.
export interface LandingCard {
  kind: "date" | "comingSoon";
  id: string;
  eventSlug: string;
  eventName: string;
  description: string | null;
  imageUrl: string | null;
  // Encuadre del recorte apaisado; ver coverPosition en event-media.ts.
  imagePosition: string;
  minPriceUsd: number | null;
  // Desglose completo por categoría: el precio depende de si eres
  // Constructor, Proveedor o Desarrollador — nunca un monto único.
  priceTiers: LandingPriceTier[];
  date?: Date;
  label?: string;
  venue?: string;
  available?: number;
  capacity?: number;
  // Solo aplica a kind "date": la parada ya se jugó, así que la tarjeta
  // deja de vender cupos y pasa a mostrar el recap con fotos (si hay).
  isPast?: boolean;
  recapPhotos?: string[];
}

export async function getLandingCards(): Promise<LandingCard[]> {
  const events = await prisma.event.findMany({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    include: {
      dates: { where: { isActive: true }, orderBy: { date: "asc" } },
      prices: { where: { isEnabled: true, amountUsd: { not: null } } },
    },
    orderBy: [{ status: "desc" }, { createdAt: "asc" }],
  });

  const cards: LandingCard[] = [];
  for (const event of events) {
    const priceTiers: LandingPriceTier[] = event.prices
      .map((p) => ({ affiliation: p.affiliation, amountUsd: Number(p.amountUsd) }))
      .filter((p): p is LandingPriceTier => !Number.isNaN(p.amountUsd))
      .sort((a, b) => a.amountUsd - b.amountUsd);
    const minPriceUsd = priceTiers.length ? priceTiers[0].amountUsd : null;

    if (event.status === "PUBLISHED" && event.dates.length > 0) {
      for (const d of event.dates) {
        const isPast = d.date.getTime() < Date.now();
        cards.push({
          kind: "date",
          id: d.id,
          eventSlug: event.slug,
          eventName: event.name,
          description: event.description,
          // event-media.ts manda; los valores de la base quedan solo como
          // respaldo para datos sembrados antes de mover esto a código.
          imageUrl: getEventCover(event.slug, d.date) ?? d.imageUrl ?? event.imageUrl,
          imagePosition: getEventCoverPosition(event.slug, d.date),
          minPriceUsd,
          priceTiers,
          date: d.date,
          label: d.label,
          venue: d.venue,
          available: Math.max(0, d.capacity - d.reservedCount),
          capacity: d.capacity,
          isPast,
          recapPhotos: isPast ? getRecapPhotos(event.slug, d.date) : [],
        });
      }
    } else {
      cards.push({
        kind: "comingSoon",
        id: event.id,
        eventSlug: event.slug,
        eventName: event.name,
        description: event.description,
        imageUrl: getEventCover(event.slug) ?? event.imageUrl,
        imagePosition: getEventCoverPosition(event.slug),
        minPriceUsd,
        priceTiers,
      });
    }
  }

  // Las tarjetas con fecha van en orden cronológico real, sin importar de
  // qué evento sean — así "Primera/Segunda/Tercera Parada" cae en el orden
  // que dice su nombre, aunque golf y pádel se consulten por separado.
  // Un evento sin fecha todavía (comingSoon) no tiene por dónde ordenarse
  // cronológicamente, así que se inserta cerca del principio en vez de
  // caer al final por orden de creación.
  const dateCards = cards
    .filter((c) => c.kind === "date")
    .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
  const comingSoonCards = cards.filter((c) => c.kind === "comingSoon");

  const ordered = [...dateCards];
  for (const card of comingSoonCards) {
    ordered.splice(Math.min(1, ordered.length), 0, card);
  }

  return ordered;
}

export interface WizardPrice {
  affiliation: "CONSTRUCTOR" | "PROVEEDOR" | "DESARROLLADOR";
  amountUsd: number | null;
  isEnabled: boolean;
}

export interface WizardEvent {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  playersPerTeam: number;
  dates: LandingEventDate[];
  prices: WizardPrice[];
}

export async function getWizardEvents(): Promise<WizardEvent[]> {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: {
      // Una parada que ya pasó no se puede seguir vendiendo, pero sigue
      // activa para la landing (recap con fotos) — por eso este filtro es
      // por fecha, no por isActive: ese campo lo controla el admin para
      // otros casos (ej. cerrar cupos antes de tiempo), no la fecha real.
      dates: {
        where: { isActive: true, date: { gte: new Date() } },
        orderBy: { date: "asc" },
      },
      prices: { orderBy: { affiliation: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return events.map((event) => ({
    id: event.id,
    slug: event.slug,
    name: event.name,
    imageUrl: event.imageUrl,
    playersPerTeam: event.playersPerTeam,
    dates: event.dates.map((d) => ({
      id: d.id,
      date: d.date,
      label: d.label,
      venue: d.venue,
      imageUrl: d.imageUrl,
      capacity: d.capacity,
      available: Math.max(0, d.capacity - d.reservedCount),
    })),
    prices: event.prices.map((p) => ({
      affiliation: p.affiliation,
      amountUsd: p.amountUsd === null ? null : Number(p.amountUsd),
      isEnabled: p.isEnabled,
    })),
  }));
}

export async function getExchangeRate(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: "usd_to_dop_rate" },
  });
  const rate = Number(setting?.value);
  return Number.isNaN(rate) || rate <= 0 ? 60 : rate;
}
