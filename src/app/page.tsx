import Image from "next/image";
import { getLandingCards } from "@/server/queries/events.queries";
import { EXPOCAMACOL, NOTA_PAGO } from "@/lib/constants";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Reveal } from "@/components/shared/reveal";
import { HeroSection } from "@/components/events/hero-section";
import { DisciplinesRow } from "@/components/events/disciplines-row";
import { BenefitsBand } from "@/components/events/benefits-band";
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
              El circuito 2026
            </h2>
            <p className="mt-3 text-muted-foreground">
              Dos deportes en Cap Cana y Punta Cana, más la delegación que
              ADECLA lleva a la feria de Medellín.
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
                Próximas paradas
              </h2>
              <p className="mt-3 text-muted-foreground">
                Elige tu parada, inscribe uno o dos jugadores y descarga tu
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

        <section className="relative py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center lg:gap-0">
            <div className="px-4 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
              <span className="section-rule" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
                Golf en escenarios de clase mundial
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
            <Reveal className="order-first flex items-center justify-center gap-4 px-4 py-6 lg:order-none lg:justify-start lg:pl-8">
              <div className="shadow-teal-hover w-[45%] max-w-[220px] -rotate-3 overflow-hidden rounded-xl border-4 border-white sm:max-w-[260px]">
                <Image
                  src="/images/campo-informacion.jpg"
                  alt="Flyer: un campo de clase mundial, 27 hoyos diseñados por P.B. Dye con vistas al mar Caribe"
                  width={400}
                  height={500}
                  className="h-auto w-full"
                />
              </div>
              <div className="shadow-teal-hover mt-10 w-[45%] max-w-[220px] rotate-2 overflow-hidden rounded-xl border-4 border-white sm:max-w-[260px]">
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

        <section
          id="expocamacol"
          className="border-t bg-white py-20 scroll-mt-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
            <div>
              <span className="section-rule section-rule--oro" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-foreground sm:text-4xl">
                {EXPOCAMACOL.nombre}
              </h2>
              <p className="mt-2 font-medium text-foreground">
                {EXPOCAMACOL.fechas} · {EXPOCAMACOL.lugar}
              </p>
              <p className="mt-4 max-w-md text-muted-foreground">
                {EXPOCAMACOL.resumen}
              </p>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                La inscripción de la delegación se llena en un formulario
                aparte. Necesitas pasaporte con al menos seis meses de
                vigencia al momento del viaje.
              </p>
              <a
                href={EXPOCAMACOL.formUrl}
                target="_blank"
                rel="noopener"
                className="mt-6 inline-flex items-center rounded-md bg-primary px-[18px] py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#005f57] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Reservar mi cupo del viaje
              </a>
            </div>
            <Reveal className="rounded-xl border bg-secondary/40 p-6">
              <p className="text-sm font-semibold text-foreground">
                Qué incluye la coordinación de ADECLA
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Vuelo, hospedaje y traslados de la delegación.</li>
                <li>Agenda académica: conferencias y charlas técnicas.</li>
                <li>Acceso a la muestra comercial de más de 500 empresas.</li>
              </ul>
              <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                Los detalles de vuelo y hospedaje se envían por correo a cada
                participante inscrito.
              </p>
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
              Patrocinadores
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Empresas que hacen posible el ADECLA Golf Tour &amp; Pádel
              Tournament 2026.
            </p>
            <Reveal className="mx-auto mt-10 max-w-sm">
              <div className="shadow-teal-hover overflow-hidden rounded-xl border-4 border-white">
                <Image
                  src="/images/patrocinadores.jpeg"
                  alt="Logos de los patrocinadores del ADECLA Golf Tour & Pádel Tournament 2026"
                  width={1280}
                  height={1600}
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
