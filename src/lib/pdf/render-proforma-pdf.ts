import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { ProformaDocument } from "@/lib/pdf/proforma-document";
import type { ProformaSnapshot } from "@/lib/pdf/proforma-types";

let cachedLogoSrc: string | null = null;

function getLogoSrc(): string {
  if (!cachedLogoSrc) {
    const logoPath = path.join(
      process.cwd(),
      "public",
      "images",
      "logo-adecla.jpg"
    );
    cachedLogoSrc = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  }
  return cachedLogoSrc;
}

// Compartido entre la ruta de descarga (/api/proformas/[id]/pdf) y el envío
// por correo, para no duplicar la lógica de render.
export async function renderProformaPdf(
  snapshot: ProformaSnapshot
): Promise<Buffer> {
  return renderToBuffer(
    createElement(ProformaDocument, {
      data: snapshot,
      logoSrc: getLogoSrc(),
    }) as ReactElement<DocumentProps>
  );
}
