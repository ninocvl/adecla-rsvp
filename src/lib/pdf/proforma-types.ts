export interface ProformaSnapshot {
  code: string;
  issuedAt: string;
  company: {
    legalName: string;
    rnc: string;
    contactName: string;
    email: string;
    phone: string;
  };
  event: {
    name: string;
    dateISO: string;
    dateLabel: string;
    venue: string;
  };
  affiliation: string;
  affiliationLabel: string;
  quantity: number;
  unitPriceUsd: string;
  totalUsd: string;
  exchangeRate: string;
  totalDopRef: string;
  participants: { fullName: string; position: number }[];
}
