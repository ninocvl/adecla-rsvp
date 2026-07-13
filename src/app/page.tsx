import Image from "next/image";
import { getLandingCards } from "@/server/queries/events.queries";
import { NOTA_PAGO } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
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

        <section id="eventos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">Eventos</h2>
            <p className="mt-2 text-muted-foreground">
              Elige tu torneo, inscribe uno o dos jugadores y descarga tu
              proforma.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <EventCard key={card.id} card={card} />
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{NOTA_PAGO}</p>
        </section>

        <section className="border-t bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
            <div className="order-2 grid grid-cols-2 gap-4 lg:order-1">
              <Image
                src="/images/campo-informacion.jpg"
                alt="Flyer: un campo de clase mundial, 27 hoyos diseñados por P.B. Dye con vistas al mar Caribe"
                width={400}
                height={500}
                className="h-auto w-full rounded-xl border shadow-md"
              />
              <Image
                src="/images/adecla-informacion.jpg"
                alt="Flyer informativo del circuito de golf de ADECLA en La Cana Golf Club"
                width={400}
                height={500}
                className="mt-6 h-auto w-full rounded-xl border shadow-md"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Campos de clase mundial
              </h2>
              <p className="mt-4 text-muted-foreground">
                El circuito se juega en Punta Espada Golf Club y La Cana Golf
                Club: 27 hoyos diseñados por P.B. Dye con vistas al mar Caribe.
                Cada parada reúne a constructores, proveedores y desarrolladores
                de La Altagracia en una jornada de competencia y networking.
              </p>
              <p className="mt-4 text-muted-foreground">
                El torneo se juega por parejas. Si todavía no tienes compañero,
                puedes inscribir un solo jugador y completar tu pareja más
                adelante.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
