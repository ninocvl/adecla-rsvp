import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Handshake,
  MapPin,
  Package,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { getEventDateDetail } from "@/server/queries/events.queries";
import { getEventDetail } from "@/lib/event-details";
import { AFFILIATION_LABELS, NOTA_PAGO, PADEL_PRICE_USD } from "@/lib/constants";
import { formatEventDate, formatUsd } from "@/lib/format";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";

export const dynamic = "force-dynamic";

// Las mismas cuatro razones de la landing, en la voz del evento concreto.
const RAZONES = [
  { icono: Users, titulo: "Conecta con líderes", texto: "y profesionales del sector." },
  { icono: TrendingUp, titulo: "Expande tu red", texto: "de contactos." },
  { icono: Handshake, titulo: "Fortalece relaciones", texto: "en un ambiente único." },
  { icono: Trophy, titulo: "Vive la competencia", texto: "y celebra los logros." },
];

interface Params {
  params: Promise<{ slug: string; fecha: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, fecha } = await params;
  const ev = await getEventDateDetail(slug, fecha);
  if (!ev) return { title: "Evento no encontrado | ADECLA" };
  return {
    title: `${ev.eventName} · ${ev.label} | ADECLA`,
    description: getEventDetail(ev.eventSlug, ev.date)?.gancho ?? undefined,
  };
}

export default async function EventoDetallePage({ params }: Params) {
  const { slug, fecha } = await params;
  const ev = await getEventDateDetail(slug, fecha);
  if (!ev) notFound();

  const detalle = getEventDetail(ev.eventSlug, ev.date);
  const esPadel = ev.eventSlug === "padel";
  const portada = detalle?.portada ?? ev.cover;
  const galeria = detalle?.galeria ?? ev.recap.slice(0, 4);
  const inscribirseHref = `/inscripciones/nueva?evento=${ev.eventSlug}&fecha=${ev.eventDateId}`;
  // "Torneo de Golf ADECLA 2026" ya trae el año en el nombre y "Torneo de
  // Pádel" no: se separa para pintarlo en oro una sola vez, sin repetirlo.
  const anio = String(ev.date.getUTCFullYear());
  const nombreBase = ev.eventName.includes(anio)
    ? ev.eventName.replace(anio, "").trim()
    : ev.eventName;

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Portada: foto del evento con velo, y la ficha de datos encima.
            En móvil la ficha baja debajo en vez de taparlo todo. */}
        <section className="relative">
          <div className="absolute inset-0 lg:right-[min(30rem,38%)]">
            {portada ? (
              <Image
                src={portada}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: detalle?.portadaPosicion ?? "center" }}
              />
            ) : (
              <div className="hero-teal size-full" />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.03_200/0.92)] via-[oklch(0.22_0.03_200/0.72)] to-[oklch(0.22_0.03_200/0.45)]"
            />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-20">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-md bg-[var(--brand-teal)] px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                {esPadel ? "Pádel" : "Golf"}
              </span>
              <h1 className="mt-4 font-heading text-4xl leading-[1.05] font-medium tracking-tight text-white sm:text-5xl">
                {nombreBase}{" "}
                <span className="text-[var(--oro-claro)]">{anio}</span>
              </h1>
              <span
                className="mt-5 block h-0.5 w-14 rounded-full bg-[var(--oro-claro)]"
                aria-hidden
              />
              <dl className="mt-6 space-y-2 text-white">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="size-5 shrink-0 text-white/70" aria-hidden />
                  <dt className="sr-only">Fecha</dt>
                  <dd className="text-lg font-medium">{formatEventDate(ev.date)}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-5 shrink-0 text-white/70" aria-hidden />
                  <dt className="sr-only">Lugar</dt>
                  <dd className="text-lg font-medium">{ev.venue}</dd>
                </div>
              </dl>
              {detalle?.gancho && (
                <p className="mt-5 max-w-md text-white/90">{detalle.gancho}</p>
              )}
            </div>

            {/* Ficha de datos */}
            <Reveal className="rounded-xl border bg-white p-5 shadow-sm lg:mt-0">
              <dl className="space-y-4 text-sm">
                <Dato icono={CalendarDays} termino="Fecha">
                  {formatEventDate(ev.date)}
                </Dato>
                <Dato icono={MapPin} termino="Lugar">
                  {ev.venue}
                </Dato>
                {detalle?.horario && (
                  <Dato icono={Clock} termino="Horario">
                    {detalle.horario.map((h) => (
                      <span key={h.dia} className="block">
                        {h.dia}: {h.filas[0]?.hora}
                        {h.filas.length > 1
                          ? ` – ${h.filas[h.filas.length - 1]?.hora}`
                          : ""}
                      </span>
                    ))}
                  </Dato>
                )}
                <Dato icono={Ticket} termino="Cupos disponibles">
                  <span className="tabular-nums">{ev.capacity}</span> en total
                  {!ev.isPast && (
                    <span className="mt-0.5 block font-medium text-primary tabular-nums">
                      {ev.available} cupos disponibles
                    </span>
                  )}
                </Dato>
                {detalle?.incluyeResumen && (
                  <Dato icono={Package} termino="Incluye">
                    {detalle.incluyeResumen}
                  </Dato>
                )}
                <div className="border-t pt-4">
                  <dt className="text-muted-foreground">
                    {esPadel ? "Por participante" : "Tarifa por participante"}
                  </dt>
                  <dd className="mt-1">
                    {esPadel ? (
                      <span className="text-lg font-semibold tabular-nums">
                        {formatUsd(PADEL_PRICE_USD)}
                      </span>
                    ) : ev.prices.length ? (
                      <ul className="space-y-1">
                        {ev.prices.map((p) => (
                          <li
                            key={p.affiliation}
                            className="flex justify-between gap-3"
                          >
                            <span className="text-muted-foreground">
                              {AFFILIATION_LABELS[p.affiliation]}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {formatUsd(p.amountUsd)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">Por confirmar</span>
                    )}
                  </dd>
                </div>
              </dl>

              {ev.isPast ? (
                <p className="mt-5 rounded-md bg-secondary/60 px-4 py-3 text-center text-sm text-muted-foreground">
                  Este evento ya se jugó.
                </p>
              ) : (
                <Link
                  href={inscribirseHref}
                  className="mt-5 flex w-full items-center justify-center rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#005f57] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  Inscribirme ahora
                </Link>
              )}
              <p className="mt-3 text-xs text-muted-foreground">{NOTA_PAGO}</p>
            </Reveal>
          </div>
        </section>

        {/* Descripción */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
            Descripción del <span className="text-[var(--oro)]">evento</span>
          </h2>
          <div className="mt-5 max-w-3xl space-y-3 text-muted-foreground">
            {(detalle?.descripcion ?? []).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <dl className="mt-12 grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-4 md:gap-x-0">
            {RAZONES.map(({ icono: Icono, titulo, texto }, i) => (
              <div
                key={titulo}
                className={`px-2 text-center md:px-6 ${
                  i > 0 ? "md:border-l md:border-border" : ""
                }`}
              >
                <Icono
                  className="mx-auto size-8 text-[var(--oro)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <dt className="mt-4 font-medium text-foreground">{titulo}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{texto}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Tira de fotos: solo si el evento tiene fotos propias. */}
        {galeria.length > 0 && (
          <section className="pb-16 sm:pb-20">
            <div className="mx-auto max-w-6xl px-4">
              <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {galeria.slice(0, 4).map((src) => (
                  <li key={src}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={src}
                        alt=""
                        fill
                        aria-hidden
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Dato({
  icono: Icono,
  termino,
  children,
}: {
  icono: typeof CalendarDays;
  termino: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0">
      <Icono className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-muted-foreground">{termino}</dt>
        <dd className="mt-0.5 font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}
