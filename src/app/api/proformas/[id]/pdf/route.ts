import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProformaDocument } from "@/lib/pdf/proforma-document";
import type { ProformaSnapshot } from "@/lib/pdf/proforma-types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    select: {
      companyId: true,
      code: true,
      proforma: { select: { snapshot: true } },
    },
  });

  if (!registration || !registration.proforma) {
    return new Response("Proforma no encontrada", { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = registration.companyId === session.user.companyId;
  if (!isAdmin && !isOwner) {
    return new Response("Sin permiso para esta proforma", { status: 403 });
  }

  const snapshot = registration.proforma.snapshot as unknown as ProformaSnapshot;
  const logoPath = path.join(
    process.cwd(),
    "public",
    "images",
    "logo-adecla.jpg"
  );
  const logoSrc = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`;

  const pdf = await renderToBuffer(
    createElement(ProformaDocument, {
      data: snapshot,
      logoSrc,
    }) as ReactElement<DocumentProps>
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proforma-${registration.code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
