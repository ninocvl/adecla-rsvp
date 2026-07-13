import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // El CLI (migrate/studio/seed) necesita la conexión directa: Prisma Migrate
    // usa advisory locks de sesión que el pooler (pgbouncer) de Neon no soporta.
    // DATABASE_URL_UNPOOLED es el nombre que usa la integración Neon-Vercel;
    // DIRECT_URL es el nombre manual (Neon standalone o .env local).
    url:
      process.env["DIRECT_URL"] ??
      process.env["DATABASE_URL_UNPOOLED"] ??
      process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
