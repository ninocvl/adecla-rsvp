-- La pareja gratis es una por empresa afiliada, no una por inscripción.
-- Un cupón por afiliada lo vuelve verificable: se reparte, se canjea una
-- vez y queda el rastro de en qué inscripción se usó.
CREATE TABLE IF NOT EXISTS "AffiliateCoupon" (
  "id"                   TEXT NOT NULL,
  "code"                 TEXT NOT NULL,
  "affiliateId"          TEXT NOT NULL,
  "usedAt"               TIMESTAMP(3),
  "usedByRegistrationId" TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateCoupon_pkey" PRIMARY KEY ("id")
);

-- El único por afiliada es lo que impide dos cupones para la misma empresa,
-- y el único por inscripción evita que un mismo canje quede pegado a dos.
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateCoupon_code_key"
  ON "AffiliateCoupon" ("code");
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateCoupon_affiliateId_key"
  ON "AffiliateCoupon" ("affiliateId");
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateCoupon_usedByRegistrationId_key"
  ON "AffiliateCoupon" ("usedByRegistrationId");
CREATE INDEX IF NOT EXISTS "AffiliateCoupon_usedAt_idx"
  ON "AffiliateCoupon" ("usedAt");

-- Si borran la afiliada, su cupón se va con ella. Si borran la inscripción
-- donde se canjeó, el cupón no desaparece: se queda registrado como usado.
-- El DO envuelve el ALTER porque ADD CONSTRAINT no acepta IF NOT EXISTS, y
-- así correr el script dos veces no rompe nada.
DO $$ BEGIN
  ALTER TABLE "AffiliateCoupon"
    ADD CONSTRAINT "AffiliateCoupon_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliateCoupon"
    ADD CONSTRAINT "AffiliateCoupon_usedByRegistrationId_fkey"
    FOREIGN KEY ("usedByRegistrationId") REFERENCES "Registration" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
