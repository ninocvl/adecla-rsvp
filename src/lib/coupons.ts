/**
 * Cupón de "pareja gratis": el beneficio de membresía es UNO por empresa
 * afiliada, no uno por inscripción.
 *
 * El código es el mismo para todas las afiliadas, para poder anunciarlo una
 * sola vez en un correo o en el grupo. Lo que se controla no es el código
 * sino quién lo canjeó: el servidor solo lo acepta si la empresa que se está
 * inscribiendo todavía no lo usó (ver el modelo CouponRedemption).
 *
 * No es un secreto: quien lo canjea ya tuvo que elegir su empresa del listado
 * real de socios. Sirve para que el beneficio se pida a propósito y quede
 * registrado, no para autenticar.
 */

// Sin O/0 ni I/1/L, que se dicta por teléfono y se copia a mano. Cambiarlo
// aquí lo cambia en el formulario, en el panel y en la proforma; los canjes
// viejos conservan el código con el que entraron.
export const CUPON_PAREJA_GRATIS = "ADECLA-PAREJA";

/**
 * Normaliza lo que escribe la persona: mayúsculas, sin espacios y con el
 * prefijo puesto si lo omitió. Así "adecla pareja", "PAREJA" y
 * "ADECLA-PAREJA" son el mismo código.
 */
export function normalizarCodigoCupon(entrada: string): string {
  const limpio = entrada
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^ADECLA-?/, "");
  return `ADECLA-${limpio}`;
}

export function esCodigoCuponValido(entrada: string): boolean {
  return normalizarCodigoCupon(entrada) === CUPON_PAREJA_GRATIS;
}
