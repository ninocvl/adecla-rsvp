-- Pádel es abierto al público y no usa el mismo esquema de afiliación que
-- golf: agrega categoría por género/nivel y el flujo de invitado de
-- patrocinador (sin proforma, con verificación blanda de RNC contra la
-- lista de patrocinadores).

-- 1) Nueva categoría de pádel
CREATE TYPE "PadelCategory" AS ENUM ('FEMENINO_B', 'FEMENINO_C', 'FEMENINO_D', 'MASCULINO_B', 'MASCULINO_C');

-- 2) affiliationType deja de ser obligatorio: pádel no lo usa
ALTER TABLE "Company" ALTER COLUMN "affiliationType" DROP NOT NULL;

-- 3) Registration: affiliation pasa a opcional (solo aplica a golf) y se
--    agregan los campos de categoría de pádel + invitado de patrocinador
ALTER TABLE "Registration" ALTER COLUMN "affiliation" DROP NOT NULL;
ALTER TABLE "Registration" ADD COLUMN "padelCategory" "PadelCategory";
ALTER TABLE "Registration" ADD COLUMN "isSponsorGuest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN "sponsorName" TEXT;
ALTER TABLE "Registration" ADD COLUMN "sponsorRnc" TEXT;
ALTER TABLE "Registration" ADD COLUMN "sponsorRncVerified" BOOLEAN NOT NULL DEFAULT false;
