import { prisma } from "@/lib/prisma";

export interface LandingEventDate {
  id: string;
  date: Date;
  label: string;
  venue: string;
  capacity: number;
  available: number;
}

export interface LandingEvent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  minPriceUsd: number | null;
  totalAvailable: number;
  dates: LandingEventDate[];
}

export async function getLandingEvents(): Promise<LandingEvent[]> {
  const events = await prisma.event.findMany({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    include: {
      dates: { where: { isActive: true }, orderBy: { date: "asc" } },
      prices: { where: { isEnabled: true, amountUsd: { not: null } } },
    },
    orderBy: [{ status: "desc" }, { createdAt: "asc" }],
  });

  return events.map((event) => {
    const priceValues = event.prices
      .map((p) => Number(p.amountUsd))
      .filter((n) => !Number.isNaN(n));
    const dates = event.dates.map((d) => ({
      id: d.id,
      date: d.date,
      label: d.label,
      venue: d.venue,
      capacity: d.capacity,
      available: Math.max(0, d.capacity - d.reservedCount),
    }));
    return {
      id: event.id,
      slug: event.slug,
      name: event.name,
      description: event.description,
      imageUrl: event.imageUrl,
      status: event.status,
      minPriceUsd: priceValues.length ? Math.min(...priceValues) : null,
      totalAvailable: dates.reduce((sum, d) => sum + d.available, 0),
      dates,
    };
  });
}

export async function getExchangeRate(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: "usd_to_dop_rate" },
  });
  const rate = Number(setting?.value);
  return Number.isNaN(rate) || rate <= 0 ? 60 : rate;
}
