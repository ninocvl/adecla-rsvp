-- RNC del listado de socios y GHIN / handicap de los participantes de golf.
-- Idempotente: se puede aplicar más de una vez (ver apply-socios-ghin-schema.ts).

ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "rnc" TEXT;

ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "ghin" TEXT;

ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "handicap" TEXT;
