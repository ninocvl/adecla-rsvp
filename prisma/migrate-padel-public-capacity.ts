// Uso único: agrega el cupo aparte de "público general" (100) a la(s)
// fecha(s) activas de pádel que ya existan, sin importar si la fecha exacta
// cambió desde que se escribió este script — se aplica por evento, no por
// fecha fija como el de la Tercera Parada de golf.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const padel = await prisma.event.findUnique({ where: { slug: "padel" } });
  if (!padel) throw new Error("No existe el evento 'padel'.");

  const dates = await prisma.eventDate.findMany({
    where: { eventId: padel.id, isActive: true },
  });

  if (dates.length === 0) {
    console.log("No hay fechas activas de pádel en esta base.");
    return;
  }

  for (const d of dates) {
    await prisma.eventDate.update({
      where: { id: d.id },
      data: { publicCapacity: 100 },
    });
    console.log(
      `✔ ${d.label} (${d.date.toISOString().slice(0, 10)}): publicCapacity=100, capacity=${d.capacity}, reservedCount=${d.reservedCount}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
