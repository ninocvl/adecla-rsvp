import Image from "next/image";
import { getLandingCards } from "@/server/queries/events.queries";
import { EXPOCAMACOL, NOTA_PAGO, REVISTA } from "@/lib/constants";
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
              Descubre nuestros eventos
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
                Próximos eventos
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
                Cada evento reunirá a constructores, desarrolladores,
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
                {EXPOCAMACOL.nombre}
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
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="max-w-xl">
              <span className="section-rule section-rule--oro" aria-hidden />
              <h2 className="font-heading text-3xl font-medium text-white sm:text-4xl">
                {REVISTA.nombre}
              </h2>
              <p className="mt-4 text-white/90">{REVISTA.resumen}</p>
              <a
                href={REVISTA.url}
                target="_blank"
                rel="noopener"
                className="mt-7 inline-flex items-center rounded-md bg-white px-[18px] py-2.5 text-sm font-semibold text-[#00453f] transition-colors hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                Leer la edición digital
              </a>
            </div>
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
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Las empresas que hacen posible los eventos de ADECLA 2026.
            </p>
            {/* Banner ancho: son ~60 logos y en la tarjeta angosta anterior no
                se leía ninguno. El tope de 859px es el ancho nativo del
                archivo — más allá next/image lo ampliaría y se vería borroso. */}
            <Reveal className="mx-auto mt-10 max-w-[859px]">
              <div className="overflow-hidden rounded-xl border bg-white p-4 sm:p-6">
                <Image
                  src="/images/patrocinadores.jpeg"
                  alt="Logos de las empresas patrocinadoras de los eventos ADECLA 2026"
                  width={859}
                  height={874}
                  sizes="(max-width: 891px) 92vw, 859px"
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
