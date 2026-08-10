-- La pareja gratis es una por empresa afiliada, no una por inscripción.
-- El código del cupón es uno solo para todas (vive en el código, no en la
-- base), así que lo único que hay que guardar es quién ya lo canjeó: el
-- único por afiliada es lo que limita el beneficio a una pareja por empresa.
--
-- Todo va en una sola sentencia, con las llaves y los únicos declarados en
-- la propia columna. Antes eran ALTER TABLE sueltos envueltos en bloques
-- DO $$, y los editores SQL por web parten mal el $$. Postgres nombra estas
-- restricciones igual que Prisma (tabla_columna_key / _fkey), así que el
-- esquema queda idéntico.
--
-- Si se borra la inscripción, el canje se va con ella y la empresa recupera
-- su pareja gratis.
CREATE TABLE IF NOT EXISTS "CouponRedemption" (
  "id"             TEXT PRIMARY KEY,
  "code"           TEXT NOT NULL,
  "affiliateId"    TEXT NOT NULL UNIQUE
                   REFERENCES "Affiliate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "registrationId" TEXT NOT NULL UNIQUE
                   REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
