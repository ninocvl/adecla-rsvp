-- Los jugadores de pádel de un club con convenio (La Peña / Viejevos) pagan
-- la inscripción con 20% de descuento en vez de la tarifa plana.

CREATE TYPE "PadelClub" AS ENUM ('LA_PENA', 'VIEJEVOS');

ALTER TABLE "Registration" ADD COLUMN "padelClub" "PadelClub";
