/**
 * Cupón de "pareja gratis": el beneficio de membresía es UNO por empresa
 * afiliada, no uno por inscripción.
 *
 * El código es el mismo para todas las afiliadas, para poder anunciarlo una
 * sola vez en un correo o en el grupo. Lo que se controla no es el código
 * sino quién lo canjeó: el servidor solo lo acepta si la empresa que se está
 * inscribiendo todavía no lo usó (ver el modelo CouponRedemption).
 *
 * IMPORTANTE: este archivo es solo de servidor. Importarlo desde un
 * componente "use client" mete el código en el JavaScript que descarga
 * cualquier visitante, y entonces se lee desde las herramientas del
 * navegador sin que ADECLA se lo haya dado a nadie. El formulario por eso
 * no comprueba el código: solo mira si escribieron algo y deja que el
 * servidor decida.
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
