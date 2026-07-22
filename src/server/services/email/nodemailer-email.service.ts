import nodemailer, { type Transporter } from "nodemailer";
import type {
  EmailService,
  ProformaEmailData,
  StatusChangeEmailData,
} from "./email.service";
import {
  renderProformaCreatedEmail,
  renderStatusChangedEmail,
} from "./templates";

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
    const { html, text } = renderProformaCreatedEmail(data);
    await this.transporter.sendMail({
      from: this.from,
      to: data.to,
      subject: `Proforma ${data.registrationCode} — ${data.eventName}`,
      text,
      html,
      attachments: data.attachments,
    });
  }

  async sendStatusChanged(data: StatusChangeEmailData): Promise<void> {
    const { html, text } = renderStatusChangedEmail(data);
    await this.transporter.sendMail({
      from: this.from,
      to: data.to,
      subject: `Tu inscripción ${data.registrationCode} cambió de estado`,
      text,
      html,
    });
  }
}
