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
  // Subtotal antes de impuesto (unitPriceUsd * quantity). Opcional: las
  // proformas emitidas antes de agregar ITBIS no tienen este campo en su
  // snapshot guardado.
  subtotalUsd?: string;
  // ITBIS (18%) calculado sobre subtotalUsd. Igual de opcional que arriba.
  itbisUsd?: string;
  // Total con ITBIS incluido si el snapshot es nuevo; en snapshots viejos
  // (sin subtotalUsd/itbisUsd) es simplemente el total sin desglosar.
  totalUsd: string;
  exchangeRate: string;
  // totalDopRef ya incluye el ITBIS en snapshots nuevos.
  totalDopRef: string;
  participants: { fullName: string; position: number }[];
}
