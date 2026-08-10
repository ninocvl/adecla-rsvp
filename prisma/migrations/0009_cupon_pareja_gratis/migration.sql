-- La pareja gratis es una por empresa afiliada, no una por inscripción.
-- El código del cupón es uno solo para todas (vive en el código, no en la
-- base), así que lo único que hay que guardar es quién ya lo canjeó: el
-- único por afiliada es lo que limita el beneficio a una pareja por empresa.
CREATE TABLE IF NOT EXISTS "CouponRedemption" (
  "id"             TEXT NOT NULL,
  "code"           TEXT NOT NULL,
  "affiliateId"    TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CouponRedemption_affiliateId_key"
  ON "CouponRedemption" ("affiliateId");
CREATE UNIQUE INDEX IF NOT EXISTS "CouponRedemption_registrationId_key"
  ON "CouponRedemption" ("registrationId");

-- Si se borra la inscripción, el canje se va con ella y la empresa recupera
-- su pareja gratis. El DO envuelve el ALTER porque ADD CONSTRAINT no acepta
-- IF NOT EXISTS, y así correr el script dos veces no rompe nada.
DO $$ BEGIN
  ALTER TABLE "CouponRedemption"
    ADD CONSTRAINT "CouponRedemption_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CouponRedemption"
    ADD CONSTRAINT "CouponRedemption_registrationId_fkey"
    FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
