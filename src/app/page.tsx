import Image from "next/image";
import Link from "next/link";
import {
  getLandingCards,
  type LandingCard,
} from "@/server/queries/events.queries";
import {
  ALMUERZO_MIVED,
  EXPOCAMACOL,
  NOTA_PAGO,
  REVISTA,
} from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";
import { HeroSection } from "@/components/events/hero-section";
import { DisciplinesRow } from "@/components/events/disciplines-row";
import { BenefitsBand } from "@/components/events/benefits-band";
import { SponsorsMarquee } from "@/components/events/sponsors-marquee";
import { MisionEmpresarialCard } from "@/components/events/mision-empresarial-card";
import { EventCard } from "@/components/events/event-card";
import { AlmuerzoMivedCard } from "@/components/events/almuerzo-mived-card";

export const dynamic = "force-dynamic";

// La misión empresarial no está en la tabla Event (se inscribe por un
// formulario aparte), así que su tarjeta se intercala aquí por fecha en vez
// de venir de la consulta.
type ItemEvento =
  | { tipo: "evento"; key: string; fecha: number; card: LandingCard }
  | { tipo: "mision"; key: string; fecha: number }
  | { tipo: "almuerzo"; key: string; fecha: number };

// Las tres disciplinas de la fila de arriba. Pulsar una filtra la lista de
// abajo en vez de llevarse a la persona a otra página: golf tiene dos
// paradas, así que "ver golf" solo tiene sentido como "muéstrame las dos".
const DISCIPLINAS: Record<string, { nombre: string; incluye: (i: ItemEvento) => boolean }> = {
  golf: {
    nombre: "Golf",
    incluye: (i) => i.tipo === "evento" && i.card.eventSlug === "golf",
  },
  padel: {
    nombre: "Pádel",
    incluye: (i) => i.tipo === "evento" && i.card.eventSlug === "padel",
  },
  networking: {
    nombre: "Networking",
    incluye: (i) => i.tipo === "mision" || i.tipo === "almuerzo",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string }>;
}) {
  const [cards, { disciplina }] = await Promise.all([
    getLandingCards(),
    searchParams,
  ]);
  const filtro = disciplina && disciplina in DISCIPLINAS ? disciplina : undefined;

  const items: ItemEvento[] = [
    ...cards.map((card) => ({
      tipo: "evento" as const,
      key: card.id,
      // Un evento sin fecha publicada va al principio, como en getLandingCards.
      fecha: card.date ? card.date.getTime() : 0,
      card,
    })),
    {
      tipo: "mision" as const,
      key: "mision-empresarial",
      fecha: new Date(`${EXPOCAMACOL.fechaInicioISO}T12:00:00Z`).getTime(),
    },
    {
      tipo: "almuerzo" as const,
      key: "almuerzo-mived",
      fecha: new Date(`${ALMUERZO_MIVED.fechaISO}T12:00:00Z`).getTime(),
    },
  ].sort((a, b) => a.fecha - b.fecha);

  const visibles = filtro ? items.filter(DISCIPLINAS[filtro].incluye) : items;

  // Lo que ya pasó deja de ser una oferta y pasa a ser memoria del año. Con
  // dos eventos vividos, mezclarlos con los que aún se venden obligaba a
  // leer la insignia de cada tarjeta para saber a cuál te puedes apuntar.
  const yaPaso = (i: ItemEvento) =>
    i.tipo === "almuerzo" || (i.tipo === "evento" && !!i.card.isPast);
  const proximos = visibles.filter((i) => !yaPaso(i));
  const vividos = visibles.filter(yaPaso).reverse();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        <section
          id="circuito"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-24"
        >
          <div className="max-w-2xl">
            <span className="section-rule section-rule--oro" aria-hidden />
            <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
              Descubre nuestros{" "}
              <span className="text-[var(--oro)]">eventos</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Dos deportes en Cap Cana y Punta Cana, más la misión empresarial
              que ADECLA lleva a Medellín.
            </p>
          </div>
          <Reveal className="mt-10">
            <DisciplinesRow activa={filtro} />
          </Reveal>
        </section>

        <section
          id="eventos"
          className="border-t bg-white py-20 scroll-mt-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <span className="section-rule" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
                Próximos <span className="text-[var(--oro)]">eventos</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                {filtro
                  ? `Solo ${DISCIPLINAS[filtro].nombre}. Inscribe uno o dos jugadores y descarga tu proforma.`
                  : "Elige tu evento, inscribe uno o dos jugadores y descarga tu proforma."}
              </p>
              {filtro && (
                <Link
                  href="/#eventos"
                  className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ver todos los eventos
                </Link>
              )}
            </div>
            {/* Fila que se arrastra en vez de grilla: con cuatro eventos la
                grilla de tres partía en dos filas y la última quedaba
                huérfana. Así entran todos lado a lado y se ruedan. */}
            <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
              {proximos.map((item, i) => (
                <li
                  key={item.key}
                  className="w-[300px] shrink-0 snap-start sm:w-[336px]"
                >
                  <Reveal delayMs={i * 70} className="h-full">
                    {item.tipo === "mision" ? (
                      <MisionEmpresarialCard />
                    ) : item.tipo === "almuerzo" ? (
                      <AlmuerzoMivedCard />
                    ) : (
                      <EventCard card={item.card} />
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">{NOTA_PAGO}</p>

            {vividos.length > 0 && (
              <div className="mt-16 border-t pt-12">
                <div className="max-w-2xl">
                  <h3 className="font-heading text-2xl font-medium text-foreground">
                    Así se <span className="text-[var(--oro)]">vivió</span>
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    Lo que ya pasó este año, con sus fotos.
                  </p>
                </div>
                <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
                  {vividos.map((item, i) => (
                    <li
                      key={item.key}
                      className="w-[300px] shrink-0 snap-start sm:w-[336px]"
                    >
                      <Reveal delayMs={i * 70} className="h-full">
                        {item.tipo === "almuerzo" ? (
                          <AlmuerzoMivedCard />
                        ) : item.tipo === "evento" ? (
                          <EventCard card={item.card} />
                        ) : (
                          <MisionEmpresarialCard />
                        )}
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <BenefitsBand />

        <section
          id="revista"
          className="hero-teal relative overflow-hidden py-20 scroll-mt-20 sm:py-24"
        >
          <div className="grain-overlay" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div className="max-w-xl">
              <span className="section-rule section-rule--oro" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-white sm:text-4xl">
                Revista <span className="text-[var(--oro-claro)]">
                  {REVISTA.nombre}
                </span>
              </h2>
              <p className="mt-2 text-white/80">{REVISTA.bajada}</p>
              <p className="mt-4 max-w-md text-white/90">{REVISTA.resumen}</p>
              <p className="mt-4 text-sm text-white/75">{REVISTA.edicion}</p>
              <a
                href={REVISTA.url}
                target="_blank"
                rel="noopener"
                className="mt-7 inline-flex items-center rounded-md bg-white px-[18px] py-2.5 text-sm font-semibold text-[#00453f] transition-colors hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                Leer la edición digital
              </a>
            </div>

            {/* La portada real de la edición, no un icono de revista. */}
            <Reveal className="order-first mx-auto w-[220px] lg:order-none lg:w-[300px]">
              <a
                href={REVISTA.url}
                target="_blank"
                rel="noopener"
                className="shadow-teal-hover block overflow-hidden rounded-lg border-4 border-white/90 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                <Image
                  src={REVISTA.portada}
                  alt={`Portada de ${REVISTA.nombre}, ${REVISTA.edicion}`}
                  width={1058}
                  height={1401}
                  sizes="(max-width: 1024px) 220px, 300px"
                  className="h-auto w-full"
                />
              </a>
            </Reveal>
          </div>
        </section>

        <section
          id="patrocinadores"
          className="border-t bg-secondary/40 py-20 scroll-mt-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 text-center">
            <span className="section-rule mx-auto" aria-hidden />
            <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
              <span className="text-[var(--oro)]">Patrocinadores</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Las empresas que hacen posible los eventos de ADECLA 2026.
            </p>
          </div>
          {/* Fuera del contenedor con padding: la franja va de borde a borde
              para que los logos entren y salgan de la pantalla. */}
          <div className="mt-10">
            <SponsorsMarquee />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
