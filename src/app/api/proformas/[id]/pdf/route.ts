import { prisma } from "@/lib/prisma";
import { renderProformaPdf } from "@/lib/pdf/render-proforma-pdf";
import type { ProformaSnapshot } from "@/lib/pdf/proforma-types";

export const runtime = "nodejs";

// Sin cuentas de empresa, no hay sesión contra la cual validar acceso: el id
// de la inscripción (cuid no adivinable) hace de enlace de acceso, igual que
// un enlace para compartir.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    select: {
      code: true,
      proforma: { select: { snapshot: true } },
    },
  });

  if (!registration || !registration.proforma) {
    return new Response("Proforma no encontrada", { status: 404 });
  }

  const snapshot = registration.proforma.snapshot as unknown as ProformaSnapshot;
  const pdf = await renderProformaPdf(snapshot);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proforma-${registration.code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
