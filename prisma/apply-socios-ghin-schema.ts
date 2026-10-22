// Aplica prisma/migrations/0013_socios_rnc_ghin/migration.sql directo (sin el
// historial de "migrate deploy", desincronizado en producción). Idempotente.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const sql = fs.readFileSync(
    path.join(__dirname, "migrations", "0013_socios_rnc_ghin", "migration.sql"),
    "utf8"
  );
  const statements = sql
    .split(/\n\s*\n/)
    .map((s) => s.replace(/^--.*$/gm, "").trim())
    .filter(Boolean);
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
  console.log(`✔ Esquema de socios/GHIN aplicado (${statements.length} sentencias).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
