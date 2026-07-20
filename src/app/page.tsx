import Image from "next/image";
import { getLandingCards } from "@/server/queries/events.queries";
import { NOTA_PAGO } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";
import { IsoMark } from "@/components/shared/iso-mark";
import { HeroSection } from "@/components/events/hero-section";
import { EventCard } from "@/components/events/event-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cards = await getLandingCards();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        <section id="eventos" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-3 flex items-center gap-2">
                <IsoMark className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                  Circuito 2026
                </span>
              </div>
              <h2 className="font-heading text-3xl leading-[1.05] font-bold text-foreground sm:text-4xl">
                Eventos
              </h2>
              <p className="mt-3 text-muted-foreground">
                Elige tu torneo, inscribe uno o dos jugadores y descarga tu
                proforma.
              </p>
            </div>
            <div>
              <div className="grid gap-6 sm:grid-cols-2">
                {cards.map((card, i) => (
                  <Reveal key={card.id} delayMs={i * 70}>
                    <EventCard card={card} />
                  </Reveal>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">{NOTA_PAGO}</p>
            </div>
          </div>
        </section>

        <section className="geo-grid-bg relative overflow-hidden bg-background py-20 sm:py-24">
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center lg:gap-0">
            <div className="px-4 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
              <div className="mb-3 flex items-center gap-2">
                <IsoMark className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                  Circuito 2026
                </span>
              </div>
              <h2 className="font-heading text-3xl leading-[1.05] font-bold text-foreground sm:text-4xl">
                Golf en escenarios
                <br className="hidden sm:block" /> de clase mundial
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                El circuito ADECLA Golf Tour 2026 se jugará en Punta Espada
                Golf Club y La Cana Golf Club, dos de los campos más
                prestigiosos del Caribe, reconocidos por su diseño, nivel
                competitivo y espectaculares vistas.
              </p>
              <p className="mt-4 max-w-md text-muted-foreground">
                Cada parada reunirá a constructores, desarrolladores,
                proveedores y aliados estratégicos del sector construcción en
                una jornada que combina competencia deportiva,
                relacionamiento empresarial y networking.
              </p>
              <p className="mt-6 max-w-md text-sm font-semibold text-foreground">
                Modalidad de juego
              </p>
              <ul className="mt-2 max-w-md list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Se juega en parejas.</li>
                <li>
                  Si aún no tienes compañero, puedes inscribirte de manera
                  individual y completar tu pareja posteriormente.
                </li>
              </ul>
            </div>
            <Reveal className="relative order-first px-4 py-10 lg:order-none lg:py-16 lg:pl-8">
              <span
                className="pointer-events-none absolute -top-6 right-4 select-none font-heading text-[6.5rem] leading-none font-bold text-carbon/[0.05] sm:text-[9rem] lg:right-10"
                aria-hidden
              >
                2026
              </span>
              <div
                className="module-glass-teal absolute -left-4 top-4 hidden h-32 w-32 rounded-2xl lg:block"
                aria-hidden
              />
              <div
                className="module-glass-blue absolute bottom-2 right-8 hidden h-24 w-24 rounded-xl lg:block"
                aria-hidden
              />
              <div className="relative flex items-center justify-center gap-3 sm:gap-5 lg:justify-start">
                <div className="module-shadow w-[46%] max-w-[230px] -rotate-2 overflow-hidden rounded-lg border-2 border-carbon bg-white">
                  <Image
                    src="/images/campo-informacion.jpg"
                    alt="Flyer: un campo de clase mundial, 27 hoyos diseñados por P.B. Dye con vistas al mar Caribe"
                    width={400}
                    height={500}
                    className="h-auto w-full"
                  />
                </div>
                <div className="module-shadow mt-14 w-[46%] max-w-[230px] rotate-1 overflow-hidden rounded-lg border-2 border-white bg-white">
                  <Image
                    src="/images/adecla-informacion.jpg"
                    alt="Flyer informativo del circuito de golf de ADECLA en La Cana Golf Club"
                    width={400}
                    height={500}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
