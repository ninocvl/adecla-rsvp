import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminRegistrations,
  getEventDatesForFilter,
} from "@/server/queries/admin.queries";
import type { RegistrationStatus } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RegistrationTable } from "@/components/admin/registration-table";

export const metadata: Metadata = {
  title: "Inscripciones | Admin ADECLA",
};

const STATUS_KEYS = Object.keys(STATUS_LABELS) as RegistrationStatus[];

export default async function AdminInscripcionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; evento?: string }>;
}) {
  const { estado, evento } = await searchParams;
  const status = STATUS_KEYS.includes(estado as RegistrationStatus)
    ? (estado as RegistrationStatus)
    : undefined;

  const [registrations, eventDates] = await Promise.all([
    getAdminRegistrations({ status, eventDateId: evento }),
    getEventDatesForFilter(),
  ]);

  function filterHref(params: { estado?: string; evento?: string }) {
    const search = new URLSearchParams();
    const nextEstado = "estado" in params ? params.estado : estado;
    const nextEvento = "evento" in params ? params.evento : evento;
    if (nextEstado) search.set("estado", nextEstado);
    if (nextEvento) search.set("evento", nextEvento);
    const qs = search.toString();
    return `/admin/inscripciones${qs ? `?${qs}` : ""}`;
  }

  const exportBaseHref = filterHref({}).replace(
    "/admin/inscripciones",
    "/admin/inscripciones/export"
  );
  const exportSeparator = exportBaseHref.includes("?") ? "&" : "?";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inscripciones</h1>
          <p className="mt-1 text-muted-foreground">
            {registrations.length} resultado
            {registrations.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
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
            Todos
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

      <RegistrationTable registrations={registrations} />
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
