-- Rol de solo lectura: entra al panel pero no puede cambiar nada.
-- ALTER TYPE ... ADD VALUE no corre dentro de una transacción en Postgres,
-- así que en el editor de Neon va como sentencia suelta.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'LECTOR';

-- Archivado reversible de inscripciones: sale del panel y libera el cupo,
-- pero la fila se conserva para auditoría o para recuperarla.
ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Registration_archivedAt_idx"
  ON "Registration" ("archivedAt");
