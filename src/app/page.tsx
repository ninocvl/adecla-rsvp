import Image from "next/image";
import { getLandingCards } from "@/server/queries/events.queries";
import { EXPOCAMACOL, NOTA_PAGO, REVISTA } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";
import { HeroSection } from "@/components/events/hero-section";
import { DisciplinesRow } from "@/components/events/disciplines-row";
import { BenefitsBand } from "@/components/events/benefits-band";
import { SponsorsMarquee } from "@/components/events/sponsors-marquee";
import { EventCard } from "@/components/events/event-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cards = await getLandingCards();

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
            <DisciplinesRow />
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
                Elige tu evento, inscribe uno o dos jugadores y descarga tu
                proforma.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, i) => (
                <Reveal key={card.id} delayMs={i * 70}>
                  <EventCard card={card} />
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{NOTA_PAGO}</p>
          </div>
        </section>

        <BenefitsBand />

        <section
          id="expocamacol"
          className="border-t bg-white py-20 scroll-mt-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-14">
            {/* El flyer oficial manda aquí: es la pieza que ya circuló por
                redes, así que la página la muestra tal cual en vez de
                reinterpretarla. */}
            <Reveal className="order-first mx-auto w-full max-w-sm lg:order-none lg:max-w-md">
              <div className="shadow-teal-hover overflow-hidden rounded-xl border-4 border-white">
                <Image
                  src={EXPOCAMACOL.flyer}
                  alt={`Flyer: ${EXPOCAMACOL.nombre}, ${EXPOCAMACOL.fechas}, junto a Camacol`}
                  width={1200}
                  height={1600}
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="h-auto w-full"
                />
              </div>
            </Reveal>

            <div>
              <span className="section-rule section-rule--oro" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
                Misión Empresarial{" "}
                <span className="text-[var(--oro)]">Medellín</span>
              </h2>
              <p className="mt-2 font-medium text-foreground">
                {EXPOCAMACOL.fechas} · {EXPOCAMACOL.lugar}
              </p>
              <p className="mt-4 max-w-md text-muted-foreground">
                {EXPOCAMACOL.resumen}
              </p>
              <ul className="mt-6 max-w-md space-y-2 text-sm text-muted-foreground">
                <li className="border-t pt-2">
                  Vuelo, hospedaje y traslados coordinados por ADECLA.
                </li>
                <li className="border-t pt-2">
                  Agenda académica: conferencias y charlas técnicas.
                </li>
                <li className="border-t pt-2">
                  Acceso a la muestra comercial de {EXPOCAMACOL.feria}.
                </li>
              </ul>
              <p className="mt-5 max-w-md text-sm text-muted-foreground">
                Necesitas pasaporte con al menos seis meses de vigencia al
                momento del viaje. Los detalles de vuelo y hospedaje se envían
                por correo a cada participante inscrito.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href={EXPOCAMACOL.formUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#005f57] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  Reservar mi cupo del viaje
                </a>
                <a
                  href={`mailto:${EXPOCAMACOL.contactoEmail}`}
                  className="-my-1.5 inline-flex items-center py-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  Solicitar más información
                </a>
              </div>
            </div>
          </div>
        </section>

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
