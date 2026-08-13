import { getAdminCoupons } from "@/server/queries/admin.queries";
import { CUPON_PAREJA_GRATIS } from "@/lib/coupons";
import { formatEventDate } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { toXlsxBuffer } from "@/lib/xlsx";

// Pensado para repartir: cada fila trae la empresa, a quién escribirle y si
// ya usó el cupón, así se arma el correo o el WhatsApp desde la hoja sin
// mandárselo dos veces a quien ya lo gastó.
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

  const { afiliadas } = await getAdminCoupons();
  const rows = afiliadas.map((a) => [
    a.name,
    CUPON_PAREJA_GRATIS,
    a.contactName ?? "",
    a.email ?? "",
    a.phone ?? "",
    a.couponRedemption ? "Ya lo usó" : "Disponible",
    a.couponRedemption?.registration.code ?? "",
    a.couponRedemption ? formatEventDate(a.couponRedemption.createdAt) : "",
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
