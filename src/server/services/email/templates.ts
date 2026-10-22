import type {
  EntradaEmailData,
  ProformaEmailData,
  StatusChangeEmailData,
} from "./email.service";
import { CONVERSATORIO } from "@/lib/entradas";
import { ADECLA } from "@/lib/constants";

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
    <h1 style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR.ink};letter-spacing:-0.01em;">Recibimos tu inscripción</h1>
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
    <p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:14px;line-height:1.6;color:${COLOR.ink};">
      Tu cupo se confirma cuando recibamos el pago. Haz la transferencia con los datos de la proforma y envíanos el comprobante respondiendo este correo o por WhatsApp al ${ADECLA.contacto.telefono}.
    </p>
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
    "Adjuntamos la proforma oficial en PDF.",
    `Tu cupo se confirma cuando recibamos el pago. Haz la transferencia con los datos de la proforma y envíanos el comprobante respondiendo este correo o por WhatsApp al ${ADECLA.contacto.telefono}.`,
    "Los pagos se realizan en pesos dominicanos utilizando la tasa del día.",
    "",
    "ADECLA",
  ].join("\n");

  return { html, text };
}

// Frase en primera persona y voz activa por estado ("estamos revisando",
// no "está siendo revisada"): así el correo suena a que alguien de ADECLA
// hizo el cambio, no a un aviso automático genérico.
const STATUS_MESSAGES: Record<string, string> = {
  PROFORMA_GENERADA: "ya generamos la proforma de tu inscripción",
  PENDIENTE_PAGO: "tu inscripción quedó pendiente de pago",
  EN_REVISION: "estamos revisando tu inscripción",
  CONFIRMADA: "tu inscripción ya está confirmada",
  CANCELADA: "cancelamos tu inscripción",
};

export function renderStatusChangedEmail(
  data: StatusChangeEmailData
): { html: string; text: string; subject: string } {
  const message = STATUS_MESSAGES[data.status] ?? "tu inscripción cambió de estado";
  const subject = `${data.registrationCode}: ${message}`;

  const html = layout(
    `Inscripción ${data.registrationCode}`,
    `
    <h1 style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR.ink};letter-spacing:-0.01em;">Actualización de tu inscripción</h1>
    <p style="margin:0 0 24px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${COLOR.inkSoft};">
      Hola ${data.contactName}, ${message} (<strong style="color:${COLOR.ink};">${data.registrationCode}</strong>).
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
    `Hola ${data.contactName},`,
    "",
    `${message.charAt(0).toUpperCase()}${message.slice(1)} (${data.registrationCode}).`,
    `Nuevo estado: ${data.newStatusLabel}`,
    "",
    "ADECLA",
  ].join("\n");

  return { html, text, subject };
}

// El QR va en el PDF adjunto, no en el cuerpo: Gmail bloquea las imágenes en
// base64 y una imagen remota se vería rota en cuanto el servidor no responda.
export function renderEntradaEmail(
  data: EntradaEmailData
): { html: string; text: string; subject: string } {
  const subject = "Tu entrada · Conversatorio ADECLA · 7 de octubre";
  const cupos = `${data.cupos} ${data.cupos === 1 ? "persona" : "personas"}`;
  const lugarLink = `<a href="${CONVERSATORIO.mapsUrl}" style="color:${COLOR.tealButton};font-weight:600;text-decoration:underline;">${CONVERSATORIO.lugar}</a>`;

  const html = layout(
    "Tu entrada · Conversatorio ADECLA",
    `
    <h1 style="margin:0 0 8px;font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;color:${COLOR.ink};letter-spacing:-0.01em;">Tu entrada está lista</h1>
    <p style="margin:0 0 24px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${COLOR.inkSoft};">
      Hola ${data.nombre}, te esperamos en el conversatorio <strong style="color:${COLOR.ink};">${CONVERSATORIO.titulo}</strong>, con ${CONVERSATORIO.invitado}, ${CONVERSATORIO.cargo}.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLOR.border};border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${detailRow("Cupos", `${data.cupos} (${cupos})`)}
      ${detailRow("Fecha", CONVERSATORIO.fecha)}
      ${detailRow("Hora", CONVERSATORIO.horario)}
      ${detailRow("Lugar", lugarLink)}
      ${detailRow("Código", data.codigo, true)}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="border-radius:8px;background-color:${COLOR.tealButton};">
          <span style="display:inline-block;padding:12px 24px;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR.surface};">Tu entrada con el QR va adjunta en PDF</span>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:14px;line-height:1.6;color:${COLOR.ink};">
      Preséntala en la entrada, impresa o en tu celular. Si el QR no se lee, basta con dictar el código <strong style="font-family:${FONT_MONO};">${data.codigo}</strong>.
    </p>
    <p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${COLOR.inkFaint};">
      El QR se valida una sola vez por cupo y no debe compartirse: quien lo presente primero es quien entra. Si tienes alguna pregunta, responde este correo.
    </p>
    `
  );

  const text = [
    `Hola ${data.nombre},`,
    "",
    `Te esperamos en el conversatorio "${CONVERSATORIO.titulo}", con ${CONVERSATORIO.invitado}, ${CONVERSATORIO.cargo}.`,
    "",
    `Cupos: ${data.cupos} (${cupos})`,
    `Fecha: ${CONVERSATORIO.fecha}`,
    `Hora: ${CONVERSATORIO.horario}`,
    `Lugar: ${CONVERSATORIO.lugar} (${CONVERSATORIO.mapsUrl})`,
    `Código: ${data.codigo}`,
    "",
    "Tu entrada con el QR va adjunta en PDF. Preséntala en la entrada, impresa o en tu celular. Si el QR no se lee, basta con dictar el código.",
    "El QR se valida una sola vez por cupo y no debe compartirse.",
    "",
    "ADECLA",
  ].join("\n");

  return { html, text, subject };
}
