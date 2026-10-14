// Aplica prisma/migrations/0012_entradas/migration.sql directo (sin el
// historial de "migrate deploy", desincronizado en producción) y deja creado
// el evento "Conversatorio" al que apuntan las entradas. Idempotente.
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
    path.join(__dirname, "migrations", "0012_entradas", "migration.sql"),
    "utf8"
  );
  // Un statement por llamada: el adaptador no acepta varios a la vez. Los
  // bloques DO $$ ... $$ llevan ";" por dentro, así que se separan por la
  // línea en blanco que hay entre cada sentencia.
  const statements = sql
    .split(/\n\s*\n/)
    .map((s) => s.replace(/^--.*$/gm, "").trim())
    .filter(Boolean);
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
  console.log(`✔ Esquema de entradas aplicado (${statements.length} sentencias).`);

  // ARCHIVED a propósito: el conversatorio no se inscribe por el wizard ni
  // debe salir como "próximamente" en las tarjetas de golf/pádel. La entrada
  // solo necesita la fila para su relación.
  await prisma.event.upsert({
    where: { slug: "conversatorio" },
    update: {},
    create: {
      slug: "conversatorio",
      name: "Conversatorio: Agenda de Vivienda y Construcción para Punta Cana",
      description:
        "Conversatorio con el Ministro de Vivienda y Edificaciones (MIVED), 7 de octubre de 2026, SBG Blue Mall, Punta Cana.",
      codePrefix: "CONV",
      status: "ARCHIVED",
      playersPerTeam: 1,
      minPlayers: 1,
    },
  });
  console.log("✔ Evento 'conversatorio' listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
