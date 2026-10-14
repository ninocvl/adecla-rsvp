import { auth } from "@/auth";
import { puedeVerPanel } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { renderEntradaPdf } from "@/lib/pdf/render-entrada-pdf";
import { nombreArchivoEntrada } from "@/lib/entradas";

export const runtime = "nodejs";

// El PDF lleva el QR que deja pasar gente: solo el panel lo descarga.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !puedeVerPanel(session.user.role)) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await params;
  const entrada = await prisma.entrada.findUnique({ where: { id } });
  if (!entrada) return new Response("Entrada no encontrada", { status: 404 });

  const pdf = await renderEntradaPdf({
    codigo: entrada.id,
    nombre: entrada.nombreTitular,
    tipo: entrada.tipoTitular,
    cupos: entrada.cupos,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nombreArchivoEntrada(entrada.nombreTitular, entrada.id)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
