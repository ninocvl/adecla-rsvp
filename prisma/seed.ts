import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Usuario administrador
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@adecla.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD no está definido. Configúralo en .env (local) o en las variables de entorno del proyecto (producción) antes de sembrar la base de datos."
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: { email: adminEmail, passwordHash, role: "ADMIN" },
  });
  console.log(`✔ Admin: ${adminEmail}`);

  // 2. Tasa de cambio de referencia
  await prisma.setting.upsert({
    where: { key: "usd_to_dop_rate" },
    update: {},
    create: { key: "usd_to_dop_rate", value: "60.00" },
  });
  console.log("✔ Setting usd_to_dop_rate = 60.00");

  // 3. Torneo de Golf (publicado, 2 fechas, precios por afiliación)
  const golf = await prisma.event.upsert({
    where: { slug: "golf" },
    update: {},
    create: {
      slug: "golf",
      name: "Torneo de Golf ADECLA 2026",
      description:
        "Circuito de golf de ADECLA en los mejores campos de Cap Cana y Punta Cana. Se juega por parejas; puedes inscribir un jugador y completar tu pareja más adelante.",
      imageUrl: "/images/golf-25-julio.jpg",
      codePrefix: "GOLF",
      status: "PUBLISHED",
      playersPerTeam: 2,
      minPlayers: 1,
    },
  });

  // Fechas guardadas a las 12:00 UTC para que no cambien de día en ninguna zona horaria.
  const golfDates = [
    {
      date: new Date("2026-07-25T12:00:00Z"),
      label: "Primera Parada",
      venue: "Punta Espada Golf Club, Cap Cana",
      imageUrl: "/images/golf-25-julio.jpg",
    },
    {
      date: new Date("2026-09-05T12:00:00Z"),
      label: "Tercera Parada",
      venue: "La Cana Golf Club, Punta Cana Resort",
      imageUrl: "/images/golf-05-septiembre.jpg",
    },
  ];
  for (const d of golfDates) {
    await prisma.eventDate.upsert({
      where: { eventId_date: { eventId: golf.id, date: d.date } },
      update: { label: d.label, venue: d.venue, imageUrl: d.imageUrl },
      create: { eventId: golf.id, capacity: 150, ...d },
    });
  }

  const golfPrices = [
    { affiliation: "CONSTRUCTOR", amountUsd: "250.00", isEnabled: true },
    { affiliation: "PROVEEDOR", amountUsd: "600.00", isEnabled: true },
    { affiliation: "DESARROLLADOR", amountUsd: null, isEnabled: false },
  ] as const;
  for (const p of golfPrices) {
    await prisma.eventPrice.upsert({
      where: {
        eventId_affiliation: { eventId: golf.id, affiliation: p.affiliation },
      },
      update: { amountUsd: p.amountUsd, isEnabled: p.isEnabled },
      create: { eventId: golf.id, ...p },
    });
  }
  console.log("✔ Torneo de Golf: 2 fechas (cap. 150) + precios");

  // 4. Torneo de Pádel (borrador: sin fechas ni precios todavía)
  await prisma.event.upsert({
    where: { slug: "padel" },
    update: {},
    create: {
      slug: "padel",
      name: "Torneo de Pádel ADECLA",
      description:
        "El circuito de pádel de ADECLA está en preparación. Pronto anunciaremos fechas, categorías y tarifas.",
      codePrefix: "PADEL",
      status: "DRAFT",
      playersPerTeam: 2,
      minPlayers: 1,
    },
  });
  console.log("✔ Torneo de Pádel (borrador)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
