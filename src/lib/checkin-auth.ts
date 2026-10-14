import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { puedeEditar, puedeVerPanel } from "@/lib/permissions";

/**
 * Quién puede validar entradas en la puerta.
 *
 * - Usuario del panel con rol ADMIN: puede ver y marcar ingresos.
 * - Usuario LECTOR: ve el estado de una entrada pero no marca nada (igual
 *   que en el resto del panel).
 * - Quien conozca el PIN del evento (CHECKIN_PIN): staff de puerta sin
 *   cuenta. Se guarda una cookie firmada, no el PIN, y cambiar el PIN en el
 *   entorno invalida todas las cookies anteriores.
 *
 * Sin sesión ni PIN, quien escanea un QR solo ve "presenta este código".
 */
export interface Staff {
  /** Quién queda anotado en el historial de ingresos. */
  etiqueta: string;
  puedeMarcar: boolean;
}

const COOKIE = "adecla_checkin";
const UNA_JORNADA = 60 * 60 * 24;

function pinEvento(): string | null {
  const pin = process.env.CHECKIN_PIN?.trim();
  return pin ? pin : null;
}

function firmar(pin: string): string {
  const secreto = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secreto).update(`checkin-v1|${pin}`).digest("hex");
}

function iguales(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function pinConfigurado(): boolean {
  return pinEvento() !== null;
}

export async function getStaff(): Promise<Staff | null> {
  const session = await auth();
  if (session?.user && puedeVerPanel(session.user.role)) {
    return {
      etiqueta: session.user.email ?? "staff",
      puedeMarcar: puedeEditar(session.user.role),
    };
  }

  const pin = pinEvento();
  if (!pin) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (token && iguales(token, firmar(pin))) {
    return { etiqueta: "PIN", puedeMarcar: true };
  }
  return null;
}

/** Devuelve true y deja la cookie si el PIN es el del evento. */
export async function validarPin(intento: string): Promise<boolean> {
  const pin = pinEvento();
  if (!pin) return false;
  if (!iguales(intento.trim(), pin)) return false;
  (await cookies()).set(COOKIE, firmar(pin), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNA_JORNADA,
  });
  return true;
}
