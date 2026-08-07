import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminParticipants,
  getEventDatesForFilter,
} from "@/server/queries/admin.queries";
import type { RegistrationStatus } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ParticipantTable } from "@/components/admin/participant-table";

export const metadata: Metadata = {
  title: "Participantes | Admin ADECLA",
};

const STATUS_KEYS = Object.keys(STATUS_LABELS) as RegistrationStatus[];

export default async function AdminParticipantesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; evento?: string }>;
}) {
  const { estado, evento } = await searchParams;
  const status = STATUS_KEYS.includes(estado as RegistrationStatus)
    ? (estado as RegistrationStatus)
    : undefined;

  const [participants, eventDates] = await Promise.all([
    getAdminParticipants({ status, eventDateId: evento }),
    getEventDatesForFilter(),
  ]);

  // El total que importa para logística es el de jugadores que sí van, así
  // que las canceladas se cuentan aparte en vez de inflar el número.
  const activos = participants.filter(
    (p) => p.registration.status !== "CANCELADA"
  ).length;
  const cancelados = participants.length - activos;

  function filterHref(params: { estado?: string; evento?: string }) {
    const search = new URLSearchParams();
    const nextEstado = "estado" in params ? params.estado : estado;
    const nextEvento = "evento" in params ? params.evento : evento;
    if (nextEstado) search.set("estado", nextEstado);
    if (nextEvento) search.set("evento", nextEvento);
    const qs = search.toString();
    return `/admin/participantes${qs ? `?${qs}` : ""}`;
  }

  const exportBaseHref = filterHref({}).replace(
    "/admin/participantes",
    "/admin/participantes/export"
  );
  const exportSeparator = exportBaseHref.includes("?") ? "&" : "?";
  const eventoActual = eventDates.find((d) => d.id === evento);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Participantes</h1>
          <p className="mt-1 text-muted-foreground">
            {eventoActual ? eventoActual.label : "Todas las fechas"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/inscripciones" />}
          >
            Ver inscripciones
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={exportBaseHref} />}
          >
            Descargar CSV
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a href={`${exportBaseHref}${exportSeparator}format=xlsx`} />
            }
          >
            Descargar Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <TotalCard
          label="Jugadores que van"
          value={activos}
          hint="Sin contar inscripciones canceladas"
        />
        <TotalCard
          label="En listado"
          value={participants.length}
          hint={
            cancelados > 0
              ? `Incluye ${cancelados} de inscripciones canceladas`
              : "Con los filtros aplicados"
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Estado:</span>
        <FilterChip href={filterHref({ estado: undefined })} active={!status}>
          Todos
        </FilterChip>
        {STATUS_KEYS.map((s) => (
          <FilterChip
            key={s}
            href={filterHref({ estado: s })}
            active={status === s}
          >
            {STATUS_LABELS[s]}
          </FilterChip>
        ))}
      </div>

      {eventDates.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Fecha:</span>
          <FilterChip href={filterHref({ evento: undefined })} active={!evento}>
            Todas
          </FilterChip>
          {eventDates.map((d) => (
            <FilterChip
              key={d.id}
              href={filterHref({ evento: d.id })}
              active={evento === d.id}
            >
              {d.label}
            </FilterChip>
          ))}
        </div>
      )}

      <ParticipantTable participants={participants} />
    </div>
  );
}

function TotalCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="min-w-[190px] flex-1 rounded-lg border bg-white p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-white hover:border-primary/50"
      )}
    >
      {children}
    </Link>
  );
}
