import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { HeroCollage } from "./hero-collage";

/*
THESIS: la landing es el circuito 2026 en orden, no una grilla de eventos
sueltos. Rechaza el arreglo por defecto de la categoría (titular centrado
sobre foto full-bleed + tres tarjetas idénticas debajo).
OWN-WORLD: teal institucional sobre blanco hueso, oro solo para nombrar el
circuito, Fraunces en titulares y Public Sans en datos. La fotografía es real
del torneo, nunca stock genérico de "networking".
STORY: el visitante ve que el circuito ya está corriendo, ubica la parada que
le toca y se inscribe sin leer toda la página.
FIRST VIEWPORT: split. Izquierda titular con el año en oro, resumen del
circuito, tres datos estructurales y la acción primaria. Derecha mosaico de
fotos reales entrando en diagonal.
FORM: extensión del mundo ya establecido; composición fijada por la
referencia que aprobó el cliente.
*/

// Datos estructurales del circuito, no métricas de vanidad: cada uno se puede
// verificar contando las tarjetas de más abajo.
const RESUMEN = [
  { valor: "3", etiqueta: "paradas" },
  { valor: "2", etiqueta: "deportes" },
  { valor: "1", etiqueta: "viaje internacional" },
];

export function HeroSection() {
  return (
    <section className="hero-teal relative overflow-hidden">
      <div className="grain-overlay" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 lg:py-24 lg:pr-0">
        <div className="max-w-xl">
          <h1 className="font-heading text-4xl leading-[1.05] font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            Eventos ADECLA{" "}
            <span className="text-[var(--oro-claro)]">2026</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/90">
            Golf en Punta Espada y La Cana, pádel en Los Establos y la feria
            Expocamacol en Medellín. Te inscribes en minutos y recibes la
            proforma al instante.
          </p>

          {/* dt antes que dd para que el HTML sea válido; el orden visual
              (número y después etiqueta) se resuelve con `order`, no
              duplicando el texto en un sr-only. */}
          <dl className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            {RESUMEN.map((item) => (
              <div key={item.etiqueta} className="flex items-baseline gap-2">
                <dt className="order-2 text-sm text-white/90">
                  {item.etiqueta}
                </dt>
                <dd className="order-1 text-2xl font-semibold tabular-nums text-[var(--oro-claro)]">
                  {item.valor}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-[#00534d] hover:bg-white/90"
              nativeButton={false}
              render={<Link href="/inscripciones/nueva" />}
            >
              Inscribirme
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="#eventos" />}
            >
              Ver el calendario
            </Button>
          </div>
        </div>

        <Reveal delayMs={150}>
          <HeroCollage />
        </Reveal>
      </div>
    </section>
  );
}
