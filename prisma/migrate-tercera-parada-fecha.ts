// Uso único: la Tercera Parada del golf se reprogramó de 5 de septiembre
// (La Cana) a 31 de octubre (Hard Rock Golf Club). Actualiza la fila
// existente en vez de crear una nueva, para no dejar huérfanas las
// inscripciones que ya apunten a su eventDateId.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const golf = await prisma.event.findUnique({ where: { slug: "golf" } });
  if (!golf) throw new Error("No existe el evento 'golf'.");

  const vieja = await prisma.eventDate.findUnique({
    where: {
      eventId_date: { eventId: golf.id, date: new Date("2026-09-05T12:00:00Z") },
    },
  });

  if (!vieja) {
    console.log(
      "No se encontró la fecha 5 de septiembre — puede que ya esté migrada o que no exista en esta base."
    );
    return;
  }

  await prisma.eventDate.update({
    where: { id: vieja.id },
    data: {
      date: new Date("2026-10-31T12:00:00Z"),
      venue: "Hard Rock Golf Club, Punta Cana",
      imageUrl: "/images/eventos-2026/golf-octubre.jpg",
    },
  });

  console.log(`✔ Tercera Parada actualizada: 5 sep → 31 oct, La Cana → Hard Rock (id ${vieja.id})`);
  console.log(
    `  Cupos (sin tocar, verifica que siga siendo 150 según lo pedido): capacity=${vieja.capacity}, reservedCount=${vieja.reservedCount}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
