import type { ProformaEmailData, StatusChangeEmailData } from "./email.service";

// URL estable de Vercel: funciona siempre, incluso si más adelante se agrega
// un dominio propio como alias adicional.
const LOGO_URL = "https://adecla-rsvp.vercel.app/images/logo-adecla.jpg";

// Paleta y tipografía tomadas directo de DESIGN.md — el mismo sistema de
// marca del sitio, no tokens inventados para el correo. Las fuentes usan
// una pila de respaldo "segura para email" (Georgia / system-ui) porque
// Outlook de escritorio y varios clientes móviles ignoran @font-face.
const COLOR = {
  tealButton: "#00776d",
  tealOfficial: "#00a99d",
  ink: "#233738",
  inkSoft: "#5c6b6b",
  inkFaint: "#8a9797",
  boneWhite: "#fcfcf7",
  surface: "#ffffff",
  border: "#e9e9e9",
  mutedBg: "#f7f7f2",
};
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";
const FONT_BODY =
  "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_MONO = "'Courier New', Courier, monospace";

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.boneWhite};font-family:${FONT_BODY};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.boneWhite};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLOR.surface};border-radius:12px;overflow:hidden;border:1px solid ${COLOR.border};">
          <tr>
            <td style="background-color:${COLOR.tealButton};padding:28px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="ADECLA" width="140" style="display:block;margin:0 auto;border:0;max-width:140px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:${COLOR.mutedBg};text-align:center;font-family:${FONT_BODY};font-size:12px;line-height:1.5;color:${COLOR.inkFaint};border-top:1px solid ${COLOR.border};">
              ADECLA — Asociación de Desarrolladores y Constructores Provincia La Altagracia
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string, mono = false): string {
  return `<tr>
    <td style="padding:12px 16px;background-color:${COLOR.mutedBg};font-family:${FONT_BODY};font-size:13px;color:${COLOR.inkSoft};border-bottom:1px solid ${COLOR.border};">${label}</td>
    <td style="padding:12px 16px;text-align:right;font-family:${mono ? FONT_MONO : FONT_BODY};font-size:14px;font-weight:600;color:${COLOR.ink};border-bottom:1px solid ${COLOR.border};">${value}</td>
  </tr>`;
}

export function renderProformaCreatedEmail(
  data: ProformaEmailData
): { html: string; text: string } {
  const html = layout(
    `Proforma ${data.registrationCode}`,
    `
    <h1 style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR.ink};letter-spacing:-0.01em;">Inscripción confirmada</h1>
    <p style="margin:0 0 24px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${COLOR.inkSoft};">
      Hola ${data.contactName}, recibimos la inscripción de <strong style="color:${COLOR.ink};">${data.companyName}</strong> para <strong style="color:${COLOR.ink};">${data.eventName}</strong>.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLOR.border};border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${detailRow("Código de inscripción", data.registrationCode, true)}
      ${detailRow("Fecha", data.eventDate)}
      ${detailRow("Total", `${data.totalUsd} <span style="font-weight:400;color:${COLOR.inkFaint};">(≈ ${data.totalDopRef})</span>`)}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="border-radius:8px;background-color:${COLOR.tealButton};">
          <span style="display:inline-block;padding:12px 24px;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR.surface};">Proforma adjunta en PDF</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${COLOR.inkFaint};">
      Los pagos se realizan en pesos dominicanos utilizando la tasa del día. Si tienes alguna pregunta, responde este correo.
    </p>
    `
  );

  const text = [
    `Hola ${data.contactName},`,
    "",
    `Recibimos la inscripción de ${data.companyName} para ${data.eventName} (${data.eventDate}).`,
    `Código de inscripción: ${data.registrationCode}`,
    `Total: ${data.totalUsd} (referencia ${data.totalDopRef})`,
    "",
    "Los pagos se realizan en pesos dominicanos utilizando la tasa del día.",
    "Adjuntamos la proforma oficial en PDF.",
    "",
    "ADECLA",
  ].join("\n");

  return { html, text };
}

export function renderStatusChangedEmail(
  data: StatusChangeEmailData
): { html: string; text: string } {
  const html = layout(
    `Inscripción ${data.registrationCode}`,
    `
    <h1 style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR.ink};letter-spacing:-0.01em;">Actualización de tu inscripción</h1>
    <p style="margin:0 0 24px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${COLOR.inkSoft};">
      La inscripción de <strong style="color:${COLOR.ink};">${data.companyName}</strong> cambió de estado.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLOR.border};border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${detailRow("Código de inscripción", data.registrationCode, true)}
      ${detailRow("Nuevo estado", data.newStatusLabel)}
    </table>
    <p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${COLOR.inkFaint};">
      Si tienes alguna pregunta sobre este cambio, responde este correo.
    </p>
    `
  );

  const text = [
    `Hola,`,
    "",
    `La inscripción ${data.registrationCode} de ${data.companyName} ahora está: ${data.newStatusLabel}.`,
    "",
    "ADECLA",
  ].join("\n");

  return { html, text };
}
