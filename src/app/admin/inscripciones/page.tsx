import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminRegistrations,
  getEventDatesForFilter,
} from "@/server/queries/admin.queries";
import type { RegistrationStatus } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RegistrationTable } from "@/components/admin/registration-table";
import { FilterMenu } from "@/components/admin/filter-menu";
import { auth } from "@/auth";
import { puedeEditar } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Inscripciones | Admin ADECLA",
};

const STATUS_KEYS = Object.keys(STATUS_LABELS) as RegistrationStatus[];

export default async function AdminInscripcionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; evento?: string; archivadas?: string }>;
}) {
  const { estado, evento, archivadas } = await searchParams;
  const verArchivadas = archivadas === "1";
  const status = STATUS_KEYS.includes(estado as RegistrationStatus)
    ? (estado as RegistrationStatus)
    : undefined;

  const [session, registrations, eventDates] = await Promise.all([
    auth(),
    getAdminRegistrations({
      status,
      eventDateId: evento,
      archivadas: verArchivadas,
    }),
    getEventDatesForFilter(),
  ]);
  const editable = puedeEditar(session?.user?.role);
  const eventoActual = eventDates.find((d) => d.id === evento);
  const hayFiltros = !!(status || evento || verArchivadas);

  function filterHref(params: {
    estado?: string;
    evento?: string;
    archivadas?: string;
  }) {
    const search = new URLSearchParams();
    const nextEstado = "estado" in params ? params.estado : estado;
    const nextEvento = "evento" in params ? params.evento : evento;
    const nextArch = "archivadas" in params ? params.archivadas : archivadas;
    if (nextEstado) search.set("estado", nextEstado);
    if (nextEvento) search.set("evento", nextEvento);
    if (nextArch) search.set("archivadas", nextArch);
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
          {/* Arrastra los filtros activos a la vista de participantes: si
              estás viendo una fecha concreta, ves los jugadores de esa
              fecha. */}
          <Button
            nativeButton={false}
            render={
              <Link
                href={filterHref({}).replace(
                  "/admin/inscripciones",
                  "/admin/participantes"
                )}
              />
            }
          >
            Ver participantes
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

      {!editable && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm text-muted-foreground">
          Tu cuenta es de solo lectura: puedes consultar y descargar, pero no
          cambiar estados, archivar ni borrar.
        </p>
      )}

      {/* Una sola línea de menús, como en Participantes: cada disparador
          dice qué hay aplicado sin abrirlo, y así caben más filtros sin
          añadir otra fila de fichas. */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterMenu
          label="Mostrar"
          value={verArchivadas ? "Archivadas" : "Vigentes"}
          active={verArchivadas}
          options={[
            {
              label: "Vigentes",
              href: filterHref({ archivadas: undefined }),
              active: !verArchivadas,
            },
            {
              label: "Archivadas",
              href: filterHref({ archivadas: "1" }),
              active: verArchivadas,
            },
          ]}
        />
        <FilterMenu
          label="Estado"
          value={status ? STATUS_LABELS[status] : "Todos"}
          active={!!status}
          options={[
            {
              label: "Todos",
              href: filterHref({ estado: undefined }),
              active: !status,
            },
            ...STATUS_KEYS.map((s) => ({
              label: STATUS_LABELS[s],
              href: filterHref({ estado: s }),
              active: status === s,
            })),
          ]}
        />
        {eventDates.length > 1 && (
          <FilterMenu
            label="Fecha"
            value={eventoActual ? eventoActual.label : "Todas"}
            active={!!evento}
            options={[
              {
                label: "Todas",
                href: filterHref({ evento: undefined }),
                active: !evento,
              },
              ...eventDates.map((d) => ({
                label: d.label,
                href: filterHref({ evento: d.id }),
                active: evento === d.id,
              })),
            ]}
          />
        )}
        {hayFiltros && (
          <Link
            href="/admin/inscripciones"
            className="ml-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Quitar filtros
          </Link>
        )}
      </div>

      <RegistrationTable registrations={registrations} editable={editable} />
    </div>
  );
}
