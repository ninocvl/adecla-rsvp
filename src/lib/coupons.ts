/**
 * Cupón de "pareja gratis": el beneficio de membresía es UNO por empresa
 * afiliada, no uno por inscripción. Cada afiliada tiene su propio código y
 * solo se puede canjear una vez.
 *
 * El código no es un secreto criptográfico: la persona que lo canjea ya tuvo
 * que elegir su empresa del listado real de socios, y el servidor lo verifica
 * contra ese registro. El código sirve para que ADECLA controle a quién le
 * entrega el beneficio, no para autenticar.
 */

// Sin O/0 ni I/1/L: estos códigos se dictan por teléfono y se copian a mano.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LARGO = 5;

export const COUPON_PREFIX = "ADECLA-";

export function generarCodigoCupon(): string {
  let cuerpo = "";
  for (let i = 0; i < LARGO; i++) {
    cuerpo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return `${COUPON_PREFIX}${cuerpo}`;
}

/**
 * Normaliza lo que escribe la persona: mayúsculas, sin espacios, y con el
 * prefijo puesto si lo omitió. Así "adecla a7k2p", "A7K2P" y "ADECLA-A7K2P"
 * son el mismo código.
 */
export function normalizarCodigoCupon(entrada: string): string {
  const limpio = entrada
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^ADECLA-?/, "");
  return `${COUPON_PREFIX}${limpio}`;
}
