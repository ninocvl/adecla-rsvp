-- Último día cuando el torneo dura más de uno. Nulo = un solo día.
-- La parada de pádel se juega el 14 y el 15, pero solo se guardaba el 14:
-- en el formulario se leía como una fecha suelta y la gente creía que era
-- uno de los dos días.
ALTER TABLE "EventDate" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);

UPDATE "EventDate" d
SET "endDate" = '2026-08-15 05:00:00'
FROM "Event" e
WHERE e.id = d."eventId"
  AND e.slug = 'padel'
  AND d.date::date = '2026-08-14';
