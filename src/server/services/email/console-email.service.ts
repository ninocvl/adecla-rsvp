import type {
  EmailService,
  ProformaEmailData,
  StatusChangeEmailData,
} from "./email.service";

// Implementación por defecto mientras no haya SMTP configurado:
// deja constancia en el log y no envía nada.
export class ConsoleEmailService implements EmailService {
  async sendProformaCreated(data: ProformaEmailData): Promise<void> {
    console.log(
      `[EMAIL STUB] Proforma ${data.registrationCode} para ${data.companyName} <${data.to}> — ${data.eventName} (${data.eventDate}), total ${data.totalUsd} (~${data.totalDopRef})`
    );
  }

  async sendStatusChanged(data: StatusChangeEmailData): Promise<void> {
    console.log(
      `[EMAIL STUB] Inscripción ${data.registrationCode} de ${data.companyName} <${data.to}> cambió a: ${data.newStatusLabel}`
    );
  }
}
