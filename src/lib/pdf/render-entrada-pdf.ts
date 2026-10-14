import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { EntradaDocument, type EntradaPdfData } from "@/lib/pdf/entrada-document";
import { urlCheckin } from "@/lib/entradas";

let plantillaCache: string | null = null;

function getPlantilla(): string {
  if (!plantillaCache) {
    const file = path.join(process.cwd(), "public", "images", "entrada-plantilla.jpg");
    plantillaCache = `data:image/jpeg;base64,${fs.readFileSync(file).toString("base64")}`;
  }
  return plantillaCache;
}

/** El QR codifica la URL de check-in. Margen 0: el blanco lo pone la plantilla. */
export async function renderEntradaPdf(data: EntradaPdfData): Promise<Buffer> {
  const qrSrc = await QRCode.toDataURL(urlCheckin(data.codigo), {
    margin: 0,
    width: 720,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  return renderToBuffer(
    createElement(EntradaDocument, {
      data,
      plantillaSrc: getPlantilla(),
      qrSrc,
    }) as ReactElement<DocumentProps>
  );
}
