import { getAdminCompanies } from "@/server/queries/admin.queries";
import { AFFILIATION_LABELS } from "@/lib/constants";
import { toCsv } from "@/lib/csv";
import { toXlsxBuffer } from "@/lib/xlsx";

const HEADERS = [
  "Empresa",
  "RNC",
  "Tipo",
  "Contacto",
  "Correo",
  "Teléfono",
  "Membresía",
  "Inscripciones",
  "Desde",
];

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format");
  const companies = await getAdminCompanies();
  const rows = companies.map((c) => [
    c.legalName,
    c.rnc,
    AFFILIATION_LABELS[c.affiliationType],
    c.contactName,
    c.email,
    c.phone,
    c.affiliate
      ? `Membresía activa: ${c.affiliate.name}`
      : c.wantsToAffiliate
        ? "Quiere ser miembro"
        : "Sin membresía ADECLA",
    c._count.registrations,
    c.createdAt.toISOString().slice(0, 10),
  ]);

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer("Empresas", HEADERS, rows);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="empresas-adecla.xlsx"',
      },
    });
  }

  return new Response(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="empresas-adecla.csv"',
    },
  });
}
