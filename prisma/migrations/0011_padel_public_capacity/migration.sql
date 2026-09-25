-- Cupo aparte para público general en pádel: el resto de la capacidad
-- queda reservado para afiliados, socios de club e invitados de
-- patrocinador aunque el público se agote primero. Nulo = sin límite
-- propio (comparte todo el cupo, como golf).
ALTER TABLE "EventDate" ADD COLUMN IF NOT EXISTS "publicCapacity" INTEGER;
ALTER TABLE "EventDate" ADD COLUMN IF NOT EXISTS "publicReservedCount" INTEGER NOT NULL DEFAULT 0;
