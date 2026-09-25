// Aplica el cambio de esquema directamente, sin pasar por el historial de
// migraciones de Prisma: ese historial está desincronizado en producción
// (migraciones previas se aplicaron por fuera de "migrate deploy"), así que
// "migrate deploy" falla en una migración vieja antes de llegar a esta.
// El SQL es el mismo de prisma/migrations/0011_padel_public_capacity, e
// idempotente (IF NOT EXISTS) por si se corre más de una vez.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "EventDate" ADD COLUMN IF NOT EXISTS "publicCapacity" INTEGER;`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "EventDate" ADD COLUMN IF NOT EXISTS "publicReservedCount" INTEGER NOT NULL DEFAULT 0;`
  );
  console.log("✔ Columnas publicCapacity/publicReservedCount listas en EventDate.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
