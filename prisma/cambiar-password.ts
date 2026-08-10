/**
 * Genera el SQL para cambiarle la contraseña a un usuario del panel, sin
 * tocar la base ni mandar la contraseña a ningún lado: el hash se calcula
 * aquí y lo único que sale por pantalla es un UPDATE listo para pegar en
 * Neon. Del hash no se puede volver a la contraseña, así que compartirlo
 * no la revela.
 *
 * Uso:
 *   npx tsx prisma/cambiar-password.ts lector@adecla.com "la-nueva"
 *
 * Si la contraseña lleva espacios o símbolos, va entre comillas.
 */
import bcrypt from "bcryptjs";

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error(
      'Faltan datos. Uso: npx tsx prisma/cambiar-password.ts correo@ejemplo.com "la-nueva"'
    );
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Usa al menos 10 caracteres.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const emailSql = email.trim().toLowerCase().replace(/'/g, "''");

  console.log(`
-- Pega esto en el editor SQL. Si responde UPDATE 0, revisa el correo:
-- no existe ningún usuario con esa dirección.
UPDATE "User"
SET "passwordHash" = '${hash}',
    "updatedAt"    = NOW()
WHERE email = '${emailSql}';
`);
}

main();
