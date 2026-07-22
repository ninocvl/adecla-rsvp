import nodemailer, { type Transporter } from "nodemailer";
import type {
  EmailService,
  ProformaEmailData,
  StatusChangeEmailData,
} from "./email.service";

// Implementación real por SMTP. Se activa con EMAIL_ENABLED=true
// y las variables SMTP_* en .env.
export class NodemailerEmailService implements EmailService {
  private transporter: Transporter;
  private from: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    this.from = process.env.EMAIL_FROM ?? "ADECLA <no-reply@adecla.do>";
  }

  async sendProformaCreated(data: ProformaEmailData): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: data.to,
      subject: `Proforma ${data.registrationCode} — ${data.eventName}`,
      text: [
        `Hola ${data.contactName},`,
        "",
        `Recibimos la inscripción de ${data.companyName} para ${data.eventName} (${data.eventDate}).`,
        `Código de inscripción: ${data.registrationCode}`,
        `Total: ${data.totalUsd} (referencia ${data.totalDopRef})`,
        "",
        "Los pagos se realizan en pesos dominicanos utilizando la tasa del día.",
        "Adjuntamos la proforma oficial; también puedes descargarla desde tu panel.",
        "",
        "ADECLA",
      ].join("\n"),
      attachments: data.attachments,
    });
  }

  async sendStatusChanged(data: StatusChangeEmailData): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: data.to,
      subject: `Tu inscripción ${data.registrationCode} cambió de estado`,
      text: [
        `Hola,`,
        "",
        `La inscripción ${data.registrationCode} de ${data.companyName} ahora está: ${data.newStatusLabel}.`,
        "",
        "Puedes ver el detalle en tu panel de ADECLA.",
      ].join("\n"),
    });
  }
}
