import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminParticipants,
  getEventDatesForFilter,
} from "@/server/queries/admin.queries";
import type {
  PadelCategory,
  RegistrationStatus,
} from "@/generated/prisma/enums";
import {
  PADEL_CATEGORIES,
  PADEL_CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ParticipantTable } from "@/components/admin/participant-table";
import { FilterMenu } from "@/components/admin/filter-menu";

export const metadata: Metadata = {
  title: "Participantes | Admin ADECLA",
};

const STATUS_KEYS = Object.keys(STATUS_LABELS) as RegistrationStatus[];

// El género no es un campo: vive en el prefijo de la categoría. Filtrar por
// él es quedarse con las tres categorías de ese lado del cuadro.
const GENEROS = [
  { value: "FEMENINO", label: "Femenina" },
  { value: "MASCULINO", label: "Masculino" },
] as const;

export default async function AdminParticipantesPage({
  searchParams,
}: {
  searchParams: Promise<{
    estado?: string;
    evento?: string;
    categoria?: string;
    genero?: string;
  }>;
}) {
  const { estado, evento, categoria, genero } = await searchParams;
  const status = STATUS_KEYS.includes(estado as RegistrationStatus)
    ? (estado as RegistrationStatus)
    : undefined;
  const padelCategory = (PADEL_CATEGORIES as readonly string[]).includes(categoria ?? "")
    ? (categoria as PadelCategory)
    : undefined;
  // Elegir una categoría concreta ya implica el género, así que el filtro
  // de género solo cuenta cuando no hay categoría elegida.
  const generoFiltro =
    !padelCategory && (genero === "FEMENINO" || genero === "MASCULINO")
      ? genero
      : undefined;

  const [participants, eventDates] = await Promise.all([
    getAdminParticipants({
      status,
      eventDateId: evento,
      padelCategory,
      genero: generoFiltro,
    }),
    getEventDatesForFilter(),
  ]);

  // El total que importa para logística es el de jugadores que sí van, así
  // que las canceladas se cuentan aparte en vez de inflar el número.
  const vigentes = participants.filter(
    (p) => p.registration.status !== "CANCELADA"
  );
  const activos = vigentes.length;
  const cancelados = participants.length - activos;

  // Parejas e individuales sobre los que sí van: es lo que hace falta para
  // saber cuántos cupos quedan por emparejar.
  const porInscripcion = new Map<string, number>();
  for (const p of vigentes) {
    porInscripcion.set(
      p.registrationId,
      (porInscripcion.get(p.registrationId) ?? 0) + 1
    );
  }
  const parejas = [...porInscripcion.values()].filter((n) => n > 1).length;
  const individuales = [...porInscripcion.values()].filter((n) => n === 1).length;

  function filterHref(params: {
    estado?: string;
    evento?: string;
    categoria?: string;
    genero?: string;
  }) {
    const search = new URLSearchParams();
    const nextEstado = "estado" in params ? params.estado : estado;
    const nextEvento = "evento" in params ? params.evento : evento;
    // Elegir categoría limpia el género y al revés: son la misma pregunta a
    // dos niveles, y mantener los dos daría combinaciones sin resultados.
    const nextCategoria =
      "categoria" in params
        ? params.categoria
        : "genero" in params
          ? undefined
          : categoria;
    const nextGenero =
      "genero" in params
        ? params.genero
        : "categoria" in params
          ? undefined
          : genero;
    if (nextEstado) search.set("estado", nextEstado);
    if (nextEvento) search.set("evento", nextEvento);
    if (nextCategoria) search.set("categoria", nextCategoria);
    if (nextGenero) search.set("genero", nextGenero);
    const qs = search.toString();
    return `/admin/participantes${qs ? `?${qs}` : ""}`;
  }

  const hayFiltros = !!(status || evento || padelCategory || generoFiltro);

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
            {[
              eventoActual ? eventoActual.label : "Todas las fechas",
              padelCategory
                ? PADEL_CATEGORY_LABELS[padelCategory]
                : generoFiltro
                  ? GENEROS.find((g) => g.value === generoFiltro)?.label
                  : null,
            ]
              .filter(Boolean)
              .join(" · ")}
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
          hint={
            cancelados > 0
              ? `${participants.length} en listado, ${cancelados} de canceladas`
              : "Sin contar inscripciones canceladas"
          }
        />
        <TotalCard
          label="Parejas completas"
          value={parejas}
          hint="Inscripciones con los dos jugadores"
        />
        <TotalCard
          label="Jugadores solos"
          value={individuales}
          hint="Les falta compañero por definir"
        />
      </div>

      {/* Los cuatro filtros responden a la misma pregunta —qué corte de la
          lista quiero ver—, así que van juntos en una línea. Antes cada uno
          desplegaba todas sus opciones como fichas en su propia fila: cuatro
          filas y dieciséis fichas para elegir cuatro cosas. */}
      <div className="flex flex-wrap items-center gap-2">
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
        <FilterMenu
          label="Género"
          value={
            generoFiltro
              ? (GENEROS.find((g) => g.value === generoFiltro)?.label ?? "Todos")
              : "Todos"
          }
          active={!!generoFiltro}
          options={[
            {
              label: "Todos",
              href: filterHref({ genero: undefined }),
              active: !generoFiltro && !padelCategory,
            },
            ...GENEROS.map((g) => ({
              label: g.label,
              href: filterHref({ genero: g.value }),
              active: generoFiltro === g.value,
            })),
          ]}
        />
        <FilterMenu
          label="Categoría"
          value={
            padelCategory ? PADEL_CATEGORY_LABELS[padelCategory] : "Todas"
          }
          active={!!padelCategory}
          options={[
            {
              label: "Todas",
              href: filterHref({ categoria: undefined }),
              active: !padelCategory,
            },
            ...PADEL_CATEGORIES.map((c) => ({
              label: PADEL_CATEGORY_LABELS[c],
              href: filterHref({ categoria: c }),
              active: padelCategory === c,
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
            href="/admin/participantes"
            className="ml-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Quitar filtros
          </Link>
        )}
      </div>

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
