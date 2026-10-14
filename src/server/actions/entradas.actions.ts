"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/server/services/email";
import { renderEntradaPdf } from "@/lib/pdf/render-entrada-pdf";
import { puedeEditar } from "@/lib/permissions";
import {
  CONVERSATORIO,
  ENTRADA_CUPOS_MAX,
  formatearCodigo,
  generarCodigoEntrada,
  nombreArchivoEntrada,
} from "@/lib/entradas";

const emitirSchema = z
  .object({
    tipo: z.enum(["AFILIADO", "EXTERNO"]),
    afiliadoId: z.string().optional(),
    nombre: z
      .string()
      .trim()
      .min(2, "Escribe el nombre")
      .max(150, "Máximo 150 caracteres"),
    correo: z.email("Escribe un correo válido"),
    telefono: z
      .string()
      .trim()
      .max(25, "Máximo 25 caracteres")
      .optional()
      .transform((v) => v || undefined),
    cupos: z
      .number()
      .int()
      .min(1, "Mínimo 1 cupo")
      .max(ENTRADA_CUPOS_MAX, `Máximo ${ENTRADA_CUPOS_MAX} cupos`),
  })
  .refine((d) => d.tipo !== "AFILIADO" || !!d.afiliadoId, {
    message: "Elige la empresa afiliada de la lista",
    path: ["afiliadoId"],
  });

export type EmitirEntradaInput = z.input<typeof emitirSchema>;
export type EntradaResult =
  | { ok: true; id: string; enviado: boolean; aviso?: string }
  | { ok: false; error: string };

async function exigirEditor() {
  const session = await auth();
  if (!session?.user || !puedeEditar(session.user.role)) return null;
  return session.user;
}

type Envio = { ok: true } | { ok: false; error: string };

/**
 * Manda el correo con el PDF. Nunca lanza: devuelve el motivo del fallo para
 * guardarlo junto a la entrada y mostrarlo al lado de "Reenviar correo".
 */
async function enviarCorreo(entrada: {
  id: string;
  nombreTitular: string;
  tipoTitular: "AFILIADO" | "EXTERNO";
  correoDestino: string;
  cupos: number;
}): Promise<Envio> {
  // Con el servicio de consola no sale nada: marcarlo como enviado sería
  // mentirle al panel justo la noche anterior al evento.
  if (process.env.EMAIL_ENABLED !== "true") {
    return {
      ok: false,
      error: "El envío de correo no está activado (EMAIL_ENABLED).",
    };
  }
  try {
    const pdf = await renderEntradaPdf({
      codigo: entrada.id,
      nombre: entrada.nombreTitular,
      tipo: entrada.tipoTitular,
      cupos: entrada.cupos,
    });
    await emailService.sendEntrada({
      to: entrada.correoDestino,
      nombre: entrada.nombreTitular,
      codigo: formatearCodigo(entrada.id),
      cupos: entrada.cupos,
      pdf: {
        filename: nombreArchivoEntrada(entrada.nombreTitular, entrada.id),
        content: pdf,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("Error enviando entrada:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message.slice(0, 200) : "No se pudo enviar.",
    };
  }
}

async function marcarEnvio(id: string, resultado: Envio) {
  await prisma.entrada.update({
    where: { id },
    data: resultado.ok
      ? { correoEnviadoAt: new Date(), correoError: null }
      : { correoError: resultado.error },
  });
}

export async function emitirEntradaAction(
  input: EmitirEntradaInput
): Promise<EntradaResult> {
  const user = await exigirEditor();
  if (!user) {
    return { ok: false, error: "Solo el administrador puede emitir entradas." };
  }

  const parsed = emitirSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const d = parsed.data;

  const evento = await prisma.event.findUnique({
    where: { slug: CONVERSATORIO.slug },
  });
  if (!evento) {
    return {
      ok: false,
      error: "Falta el evento del conversatorio en la base de datos.",
    };
  }

  // El nombre de un afiliado sale de la base, nunca de lo que mande el cliente.
  let nombre = d.nombre;
  if (d.tipo === "AFILIADO") {
    const afiliado = await prisma.affiliate.findUnique({
      where: { id: d.afiliadoId },
    });
    if (!afiliado) return { ok: false, error: "Esa empresa afiliada no existe." };
    nombre = afiliado.name;
  }

  // Código aleatorio único: si choca con uno existente (muy improbable con
  // 32^8 combinaciones) se genera otro.
  let entrada = null;
  for (let intento = 0; intento < 5 && !entrada; intento++) {
    try {
      entrada = await prisma.entrada.create({
        data: {
          id: generarCodigoEntrada(),
          eventoId: evento.id,
          tipoTitular: d.tipo,
          afiliadoId: d.tipo === "AFILIADO" ? d.afiliadoId : null,
          nombreTitular: nombre,
          correoDestino: d.correo.toLowerCase(),
          telefono: d.telefono,
          cupos: d.cupos,
          creadaPorId: user.id,
        },
      });
    } catch (e) {
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  if (!entrada) {
    return {
      ok: false,
      error: "No pudimos generar un código único. Intenta de nuevo.",
    };
  }

  const envio = await enviarCorreo(entrada);
  await marcarEnvio(entrada.id, envio);
  revalidatePath("/admin/entradas");

  return envio.ok
    ? { ok: true, id: entrada.id, enviado: true }
    : {
        ok: true,
        id: entrada.id,
        enviado: false,
        aviso: `La entrada se creó, pero el correo no salió: ${envio.error}`,
      };
}

export async function reenviarEntradaAction(id: string): Promise<EntradaResult> {
  if (!(await exigirEditor())) {
    return { ok: false, error: "Solo el administrador puede reenviar." };
  }
  const entrada = await prisma.entrada.findUnique({ where: { id } });
  if (!entrada) return { ok: false, error: "No encontramos esa entrada." };
  if (entrada.anulada) return { ok: false, error: "La entrada está anulada." };

  const envio = await enviarCorreo(entrada);
  await marcarEnvio(id, envio);
  revalidatePath("/admin/entradas");
  return envio.ok
    ? { ok: true, id, enviado: true }
    : { ok: false, error: `El correo no salió: ${envio.error}` };
}

export async function anularEntradaAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await exigirEditor())) {
    return { ok: false, error: "Solo el administrador puede anular." };
  }
  const { count } = await prisma.entrada.updateMany({
    where: { id },
    data: { anulada: true },
  });
  if (count === 0) return { ok: false, error: "No encontramos esa entrada." };
  revalidatePath("/admin/entradas");
  revalidatePath(`/checkin/${id}`);
  return { ok: true };
}
