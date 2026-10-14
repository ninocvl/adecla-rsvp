-- Entradas con QR para eventos ya pagados por fuera (conversatorio MIVED).
-- Idempotente: el historial de "migrate deploy" está desincronizado en
-- producción, así que esto se aplica con prisma/apply-entradas-schema.ts.
DO $$ BEGIN
  CREATE TYPE "EntradaTipo" AS ENUM ('AFILIADO', 'EXTERNO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Entrada" (
  "id" TEXT NOT NULL,
  "eventoId" TEXT NOT NULL,
  "tipoTitular" "EntradaTipo" NOT NULL,
  "afiliadoId" TEXT,
  "nombreTitular" TEXT NOT NULL,
  "correoDestino" TEXT NOT NULL,
  "telefono" TEXT,
  "cupos" INTEGER NOT NULL,
  "ingresados" INTEGER NOT NULL DEFAULT 0,
  "anulada" BOOLEAN NOT NULL DEFAULT false,
  "correoEnviadoAt" TIMESTAMP(3),
  "correoError" TEXT,
  "creadaPorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Entrada_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Entrada_cupos_check" CHECK ("cupos" BETWEEN 1 AND 3),
  CONSTRAINT "Entrada_ingresados_check" CHECK ("ingresados" >= 0 AND "ingresados" <= "cupos")
);

CREATE TABLE IF NOT EXISTS "EntradaIngreso" (
  "id" TEXT NOT NULL,
  "entradaId" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "staff" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revertidoAt" TIMESTAMP(3),
  CONSTRAINT "EntradaIngreso_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Entrada_eventoId_idx" ON "Entrada"("eventoId");

CREATE INDEX IF NOT EXISTS "EntradaIngreso_entradaId_idx" ON "EntradaIngreso"("entradaId");

DO $$ BEGIN
  ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_afiliadoId_fkey" FOREIGN KEY ("afiliadoId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "EntradaIngreso" ADD CONSTRAINT "EntradaIngreso_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "Entrada"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
