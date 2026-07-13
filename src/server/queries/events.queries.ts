import { prisma } from "@/lib/prisma";

export interface LandingEventDate {
  id: string;
  date: Date;
  label: string;
  venue: string;
  imageUrl: string | null;
  capacity: number;
  available: number;
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
  minPriceUsd: number | null;
  date?: Date;
  label?: string;
  venue?: string;
  available?: number;
  capacity?: number;
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
    const priceValues = event.prices
      .map((p) => Number(p.amountUsd))
      .filter((n) => !Number.isNaN(n));
    const minPriceUsd = priceValues.length ? Math.min(...priceValues) : null;

    if (event.status === "PUBLISHED" && event.dates.length > 0) {
      for (const d of event.dates) {
        cards.push({
          kind: "date",
          id: d.id,
          eventSlug: event.slug,
          eventName: event.name,
          description: event.description,
          imageUrl: d.imageUrl ?? event.imageUrl,
          minPriceUsd,
          date: d.date,
          label: d.label,
          venue: d.venue,
          available: Math.max(0, d.capacity - d.reservedCount),
          capacity: d.capacity,
        });
      }
    } else {
      cards.push({
        kind: "comingSoon",
        id: event.id,
        eventSlug: event.slug,
        eventName: event.name,
        description: event.description,
        imageUrl: event.imageUrl,
        minPriceUsd,
      });
    }
  }
  return cards;
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
      dates: { where: { isActive: true }, orderBy: { date: "asc" } },
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
