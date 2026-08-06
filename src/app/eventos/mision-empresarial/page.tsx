import type { Metadata } from "next";
import Image from "next/image";
import {
  CalendarDays,
  Handshake,
  MapPin,
  Package,
  Plane,
  Presentation,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { EXPOCAMACOL } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: `${EXPOCAMACOL.nombre} | ADECLA`,
  description: EXPOCAMACOL.resumen,
};

const RAZONES = [
  { icono: Users, titulo: "Conecta con líderes", texto: "de toda la región." },
  { icono: TrendingUp, titulo: "Expande tu red", texto: "fuera del país." },
  { icono: Handshake, titulo: "Fortalece relaciones", texto: "con la delegación." },
  { icono: Presentation, titulo: "Aprende de la agenda", texto: "técnica y académica." },
];

const INCLUYE = [
  { icono: Plane, texto: "Vuelo, hospedaje y traslados coordinados por ADECLA." },
  { icono: Presentation, texto: "Agenda académica: conferencias y charlas técnicas." },
  { icono: Store, texto: `Acceso a la muestra comercial de ${EXPOCAMACOL.feria}.` },
];

export default function MisionEmpresarialPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 lg:right-[min(30rem,38%)]">
            <Image
              src={EXPOCAMACOL.flyer}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center top" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.03_200/0.93)] via-[oklch(0.22_0.03_200/0.75)] to-[oklch(0.22_0.03_200/0.45)]"
            />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-20">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-md bg-[var(--brand-teal)] px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                Networking
              </span>
              <h1 className="mt-4 font-heading text-4xl leading-[1.05] font-medium tracking-tight text-white sm:text-5xl">
                Misión Empresarial{" "}
                <span className="text-[var(--oro-claro)]">Medellín</span>
              </h1>
              <span
                className="mt-5 block h-0.5 w-14 rounded-full bg-[var(--oro-claro)]"
                aria-hidden
              />
              <dl className="mt-6 space-y-2 text-white">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="size-5 shrink-0 text-white/70" aria-hidden />
                  <dt className="sr-only">Fecha</dt>
                  <dd className="text-lg font-medium">
                    {EXPOCAMACOL.fechas} de 2026
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-5 shrink-0 text-white/70" aria-hidden />
                  <dt className="sr-only">Lugar</dt>
                  <dd className="text-lg font-medium">{EXPOCAMACOL.lugar}</dd>
                </div>
              </dl>
              <p className="mt-5 max-w-md text-white/90">
                {EXPOCAMACOL.reclamo} Cuatro días en la feria de construcción
                más grande de Colombia, con la delegación de ADECLA.
              </p>
            </div>

            <Reveal className="rounded-xl border bg-white p-5 shadow-sm">
              <dl className="space-y-4 text-sm">
                <div className="flex gap-3 border-b pb-4">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <dt className="text-muted-foreground">Fecha</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {EXPOCAMACOL.fechas} de 2026
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 border-b pb-4">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <dt className="text-muted-foreground">Lugar</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {EXPOCAMACOL.lugar}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Package className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <dt className="text-muted-foreground">Incluye</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      Vuelo, hospedaje, traslados y acceso a la feria.
                    </dd>
                  </div>
                </div>
              </dl>

              <a
                href={EXPOCAMACOL.formUrl}
                target="_blank"
                rel="noopener"
                className="mt-5 flex w-full items-center justify-center rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#005f57] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Reservar mi cupo del viaje
              </a>
              <a
                href={`mailto:${EXPOCAMACOL.contactoEmail}`}
                className="mt-3 flex w-full items-center justify-center rounded-md border px-[18px] py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Solicitar más información
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                La inscripción se completa en un formulario aparte.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
            Descripción del <span className="text-[var(--oro)]">evento</span>
          </h2>
          <div className="mt-5 max-w-3xl space-y-3 text-muted-foreground">
            <p>{EXPOCAMACOL.resumen}</p>
            <p>
              Necesitas pasaporte con al menos seis meses de vigencia al momento
              del viaje. Los detalles de vuelo y hospedaje se envían por correo a
              cada participante inscrito.
            </p>
          </div>

          <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {INCLUYE.map(({ icono: Icono, texto }) => (
              <li
                key={texto}
                className="rounded-lg border bg-white p-4 text-sm text-muted-foreground"
              >
                <Icono
                  className="size-5 text-[var(--oro)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="mt-3 block">{texto}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-14 grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-4 md:gap-x-0">
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
      </main>
      <Footer />
    </div>
  );
}
