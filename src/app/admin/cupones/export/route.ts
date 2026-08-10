import { getAdminCoupons } from "@/server/queries/admin.queries";
import { formatEventDate } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { toXlsxBuffer } from "@/lib/xlsx";

// Pensado para repartir: cada fila trae la empresa, su código y a quién
// escribirle, así se puede armar el correo o el WhatsApp desde la hoja.
const HEADERS = [
  "Empresa afiliada",
  "Cupón",
  "Contacto",
  "Correo",
  "Teléfono",
  "Estado",
  "Inscripción donde se usó",
  "Fecha de canje",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const { cupones } = await getAdminCoupons();
  const rows = cupones.map((c) => [
    c.affiliate.name,
    c.code,
    c.affiliate.contactName ?? "",
    c.affiliate.email ?? "",
    c.affiliate.phone ?? "",
    c.usedAt ? "Canjeado" : "Sin usar",
    c.usedByRegistration?.code ?? "",
    c.usedAt ? formatEventDate(c.usedAt) : "",
  ]);

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer("Cupones", HEADERS, rows);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="cupones-adecla.xlsx"',
      },
    });
  }

  return new Response(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cupones-adecla.csv"',
    },
  });
}
