-- Categoría "Masculino A" de pádel. Estaba en el desplegable (constants.ts)
-- pero no en el enum de la base ni en el validador, así que elegirla daba
-- "Invalid option" y la inscripción no pasaba.
ALTER TYPE "PadelCategory" ADD VALUE IF NOT EXISTS 'MASCULINO_A';
