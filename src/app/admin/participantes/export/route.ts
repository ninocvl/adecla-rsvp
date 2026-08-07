import {
  getAdminParticipants,
  type AdminParticipantFilters,
} from "@/server/queries/admin.queries";
import { STATUS_LABELS, getCategoryLabel } from "@/lib/constants";
import { formatEventDate } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { toXlsxBuffer } from "@/lib/xlsx";
import type { RegistrationStatus } from "@/generated/prisma/enums";

// Una fila por jugador, no por inscripción: es el listado que se le pasa al
// club para armar los grupos, así que una pareja tiene que salir como dos
// personas con sus datos completos.
const HEADERS = [
  "#",
  "Participante",
  "Posición",
  "Correo",
  "Teléfono",
  "Empresa",
  "RNC",
  "Correo empresa",
  "Teléfono empresa",
  "Evento",
  "Fecha",
  "Parada",
  "Lugar",
  "Categoría",
  "Estado",
  "Código inscripción",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const evento = searchParams.get("evento");
  const format = searchParams.get("format");

  const filters: AdminParticipantFilters = {};
  if (estado && estado in STATUS_LABELS) {
    filters.status = estado as RegistrationStatus;
  }
  if (evento) filters.eventDateId = evento;

  const participants = await getAdminParticipants(filters);
  const rows = participants.map((p, i) => {
    const r = p.registration;
    return [
      i + 1,
      p.fullName,
      p.position === 1 ? "Titular" : "Acompañante",
      p.email ?? "",
      p.phone ?? "",
      r.company.legalName,
      r.company.rnc,
      r.company.email,
      r.company.phone,
      r.event.name,
      formatEventDate(r.eventDate.date),
      r.eventDate.label,
      r.eventDate.venue,
      getCategoryLabel(r.affiliation, r.padelCategory, r.padelClub),
      STATUS_LABELS[r.status],
      r.code,
    ];
  });

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer("Participantes", HEADERS, rows);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="participantes-adecla.xlsx"',
      },
    });
  }

  return new Response(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="participantes-adecla.csv"',
    },
  });
}
