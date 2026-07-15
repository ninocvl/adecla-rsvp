import {
  getAdminRegistrations,
  type AdminRegistrationFilters,
} from "@/server/queries/admin.queries";
import { AFFILIATION_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatEventDate } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { toXlsxBuffer } from "@/lib/xlsx";
import type { RegistrationStatus } from "@/generated/prisma/enums";

const HEADERS = [
  "Código",
  "Empresa",
  "RNC",
  "Evento",
  "Fecha",
  "Categoría",
  "Participantes",
  "Total USD",
  "Estado",
  "Creada",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const evento = searchParams.get("evento");
  const format = searchParams.get("format");

  const filters: AdminRegistrationFilters = {};
  if (estado && estado in STATUS_LABELS) {
    filters.status = estado as RegistrationStatus;
  }
  if (evento) filters.eventId = evento;

  const registrations = await getAdminRegistrations(filters);
  const rows = registrations.map((r) => [
    r.code,
    r.company.legalName,
    r.company.rnc,
    r.event.name,
    formatEventDate(r.eventDate.date),
    AFFILIATION_LABELS[r.affiliation],
    r.participants.map((p) => p.fullName).join(" / "),
    r.totalUsd.toString(),
    STATUS_LABELS[r.status],
    r.createdAt.toISOString().slice(0, 10),
  ]);

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer("Inscripciones", HEADERS, rows);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="inscripciones-adecla.xlsx"',
      },
    });
  }

  return new Response(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inscripciones-adecla.csv"',
    },
  });
}
