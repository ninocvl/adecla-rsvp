import Image from "next/image";
import { getLandingCards } from "@/server/queries/events.queries";
import { NOTA_PAGO } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";
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

        <section id="eventos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="section-rule" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
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

        <section className="relative bg-white py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center lg:gap-0">
            <div className="px-4 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
              <span className="section-rule" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
                Campos de clase mundial
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                El circuito se juega en Punta Espada Golf Club y La Cana Golf
                Club: 27 hoyos diseñados por P.B. Dye con vistas al mar Caribe.
                Cada parada reúne a constructores, proveedores y desarrolladores
                de La Altagracia en una jornada de competencia y networking.
              </p>
              <p className="mt-4 max-w-md text-muted-foreground">
                El torneo se juega por parejas. Si todavía no tienes compañero,
                puedes inscribir un solo jugador y completar tu pareja más
                adelante.
              </p>
            </div>
            <Reveal className="relative order-first mx-4 h-[320px] sm:h-[420px] lg:order-none lg:mx-0 lg:h-[480px]">
              <Image
                src="/images/campo-informacion.jpg"
                alt="Flyer: un campo de clase mundial, 27 hoyos diseñados por P.B. Dye con vistas al mar Caribe"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="rounded-xl object-cover lg:rounded-l-none lg:rounded-r-xl"
              />
              <div className="absolute -bottom-8 left-4 w-[55%] overflow-hidden rounded-xl border-4 border-white sm:left-8">
                <Image
                  src="/images/adecla-informacion.jpg"
                  alt="Flyer informativo del circuito de golf de ADECLA en La Cana Golf Club"
                  width={400}
                  height={500}
                  className="h-auto w-full"
                />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
