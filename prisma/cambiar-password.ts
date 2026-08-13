/**
 * Genera el SQL para cambiarle la contraseña a un usuario del panel, sin
 * tocar la base. El hash se calcula aquí y lo único que aparece en pantalla
 * es un UPDATE listo para pegar en Neon: del hash no se puede volver a la
 * contraseña, así que ese sí se puede copiar tranquilo.
 *
 * La contraseña se escribe cuando el script la pide, no como argumento: así
 * no queda a la vista de quien pase por detrás ni en el historial de la
 * terminal, que guarda cada comando tal como se tecleó.
 *
 * Uso:
 *   npx tsx prisma/cambiar-password.ts
 */
import readline from "node:readline";
import bcrypt from "bcryptjs";

// terminal solo cuando de verdad hay una terminal. Con la entrada
// canalizada no hay teclas que tapar, y el modo terminal ahí se traga las
// respuestas siguientes en la primera pregunta.
const enTerminal = Boolean(process.stdin.isTTY);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: enTerminal,
});

// Se leen las respuestas con el iterador en vez de rl.question porque el
// iterador pausa la entrada entre pregunta y pregunta. Con question, las
// líneas que ya venían escritas se emitían antes de registrar la siguiente
// pregunta y se perdían.
const lineas = rl[Symbol.asyncIterator]();

let ocultando = false;
if (enTerminal) {
  // readline escribe cada tecla en pantalla mientras se teclea. Mientras
  // ocultando esté activo se descarta esa salida, así que no queda a la
  // vista lo que se escribe.
  const interno = rl as unknown as { _writeToOutput: (s: string) => void };
  const escribirNormal = interno._writeToOutput.bind(rl);
  interno._writeToOutput = (s: string) => {
    if (!ocultando) escribirNormal(s);
  };
}

async function preguntar(texto: string, oculta = false): Promise<string> {
  process.stdout.write(texto);
  ocultando = oculta && enTerminal;
  const { value } = await lineas.next();
  if (ocultando) process.stdout.write("\n");
  ocultando = false;
  return (value ?? "").trim();
}

function salir(mensaje: string): never {
  console.error(`\n${mensaje}`);
  rl.close();
  process.exit(1);
}

async function main() {
  const email = (await preguntar("Correo del usuario: ")).toLowerCase();
  if (!email.includes("@")) salir("Eso no parece un correo.");

  const password = await preguntar("Contraseña nueva: ", true);
  if (password.length < 10) salir("Usa al menos 10 caracteres.");

  // Escrita a ciegas, un dedazo dejaría a la persona fuera del panel sin
  // forma de darse cuenta hasta intentar entrar.
  const confirmacion = await preguntar("Repítela: ", true);
  if (password !== confirmacion) salir("No coinciden. No se generó nada.");

  const hash = await bcrypt.hash(password, 10);
  rl.close();

  console.log(`
-- Pega esto en el editor SQL. Si responde UPDATE 0, revisa el correo:
-- no existe ningún usuario con esa dirección.
UPDATE "User"
SET "passwordHash" = '${hash}',
    "updatedAt"    = NOW()
WHERE email = '${email.replace(/'/g, "''")}';
`);
}

main();
