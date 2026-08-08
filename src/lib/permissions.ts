import type { Role } from "@/generated/prisma/enums";

/**
 * Quién puede entrar al panel y quién puede además cambiar cosas.
 *
 * - ADMIN: lo ve todo y lo cambia todo (estados, archivar, borrar).
 * - LECTOR: entra al panel y consulta, pero no muta nada.
 * - COMPANY: no entra al panel.
 *
 * Un solo lugar decide esto para que la vista y las acciones del servidor no
 * se contradigan: ocultar un botón no es seguridad, así que cada acción
 * vuelve a preguntar aquí antes de tocar la base.
 */
export const ROLES_PANEL: Role[] = ["ADMIN", "LECTOR"];

export function puedeVerPanel(role?: string | null): boolean {
  return ROLES_PANEL.includes(role as Role);
}

/** Cambiar estados, archivar, restaurar y borrar. Solo ADMIN. */
export function puedeEditar(role?: string | null): boolean {
  return role === "ADMIN";
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  LECTOR: "Solo lectura",
  COMPANY: "Empresa",
};
