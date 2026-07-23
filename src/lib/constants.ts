export const ADECLA = {
  nombre: "ADECLA",
  nombreLegal:
    "Asociación de Desarrolladores y Constructores Provincia La Altagracia",
  rnc: "430134309",
  direccion: [
    "Boulevar 1ro. De Noviembre",
    "Edificio Cedro, Suite 1002P",
    "Punta Cana Village, Punta Cana, Rep. Dom.",
  ],
  contacto: {
    telefono: "+1 (829) 488-8662",
    // Solo dígitos con código de país, formato que requiere el link wa.me.
    whatsapp: "18294888662",
    email: "adecla.adm@gmail.com",
  },
  banco: {
    nombre: "Banco Popular",
    tipoCuenta: "Cuenta corriente",
    numero: "782705941",
    titular: "ADECLA",
    rnc: "430134309",
  },
} as const;

export const NOTA_PAGO =
  "*Los pagos se realizan en pesos dominicanos utilizando la tasa del día.";

// ITBIS (impuesto sobre transferencia de bienes y servicios) vigente en RD.
// Se aplica sobre el subtotal de cada inscripción para llegar al total real
// a pagar — ver DESIGN.md / factura proforma.
export const ITBIS_RATE = 0.18;

export const AFFILIATION_LABELS: Record<string, string> = {
  CONSTRUCTOR: "Constructor",
  PROVEEDOR: "Proveedor / Entidades de apoyo",
  DESARROLLADOR: "Desarrollador",
};

export const STATUS_LABELS: Record<string, string> = {
  PROFORMA_GENERADA: "Proforma generada",
  PENDIENTE_PAGO: "Pendiente de pago",
  EN_REVISION: "En revisión",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};
