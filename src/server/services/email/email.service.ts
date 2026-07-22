export interface ProformaEmailAttachment {
  filename: string;
  content: Buffer;
}

export interface ProformaEmailData {
  to: string;
  companyName: string;
  contactName: string;
  registrationCode: string;
  eventName: string;
  eventDate: string;
  totalUsd: string;
  totalDopRef: string;
  attachments: ProformaEmailAttachment[];
}

export interface StatusChangeEmailData {
  to: string;
  companyName: string;
  registrationCode: string;
  newStatusLabel: string;
}

export interface EmailService {
  sendProformaCreated(data: ProformaEmailData): Promise<void>;
  sendStatusChanged(data: StatusChangeEmailData): Promise<void>;
}
