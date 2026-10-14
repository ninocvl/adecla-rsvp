"use server";

import { revalidatePath } from "next/cache";
import { getStaff, validarPin } from "@/lib/checkin-auth";
import { ENTRADA_CUPOS_MAX, normalizarCodigo } from "@/lib/entradas";
import { deshacerUltimoIngreso, marcarIngreso } from "@/server/services/checkin";

export type CheckinResult = { ok: true } | { ok: false; error: string };

export async function entrarConPinAction(pin: string): Promise<CheckinResult> {
  const ok = await validarPin(pin);
  if (!ok) {
    // Frena un poco el tanteo de PINs; no es un límite real (cada petición
    // puede caer en otra instancia), pero el PIN es de un solo evento.
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "PIN incorrecto." };
  }
  return { ok: true };
}

export async function registrarIngresoAction(
  entradaId: string,
  cantidad: number
): Promise<CheckinResult> {
  const staff = await getStaff();
  if (!staff?.puedeMarcar) {
    return { ok: false, error: "No tienes permiso para marcar ingresos." };
  }

  const id = normalizarCodigo(entradaId);
  if (
    !id ||
    !Number.isInteger(cantidad) ||
    cantidad < 1 ||
    cantidad > ENTRADA_CUPOS_MAX
  ) {
    return { ok: false, error: "Datos inválidos." };
  }

  const marcado = await marcarIngreso(id, cantidad, staff.etiqueta);
  revalidatePath(`/checkin/${id}`);
  return marcado
    ? { ok: true }
    : {
        ok: false,
        error:
          "No se pudo marcar: la entrada ya no tiene esos cupos o está anulada. Revisa el estado.",
      };
}

export async function deshacerIngresoAction(
  entradaId: string
): Promise<CheckinResult> {
  const staff = await getStaff();
  if (!staff?.puedeMarcar) {
    return { ok: false, error: "No tienes permiso para marcar ingresos." };
  }
  const id = normalizarCodigo(entradaId);
  if (!id) return { ok: false, error: "Datos inválidos." };

  const deshecho = await deshacerUltimoIngreso(id);
  revalidatePath(`/checkin/${id}`);
  return deshecho
    ? { ok: true }
    : { ok: false, error: "No hay ingresos que deshacer." };
}
