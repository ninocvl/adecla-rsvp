import type { EmailService } from "./email.service";
import { ConsoleEmailService } from "./console-email.service";
import { NodemailerEmailService } from "./nodemailer-email.service";

function createEmailService(): EmailService {
  if (process.env.EMAIL_ENABLED === "true") {
    return new NodemailerEmailService();
  }
  return new ConsoleEmailService();
}

export const emailService: EmailService = createEmailService();
export type { EmailService };
