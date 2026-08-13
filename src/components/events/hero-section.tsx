import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { HeroCollage } from "./hero-collage";

/*
THESIS: la landing es la agenda de eventos ADECLA 2026 en orden, no una
grilla de eventos sueltos. Rechaza el arreglo por defecto de la categoría
(titular centrado sobre foto full-bleed + tres tarjetas idénticas debajo).
OWN-WORLD: teal institucional sobre blanco hueso, oro solo para nombrar la
marca, Fraunces en titulares y Public Sans en datos. La fotografía es real
del torneo, nunca stock genérico de "networking".
STORY: el visitante ve que el año ya está corriendo, ubica el evento que le
toca y se inscribe sin leer toda la página.
FIRST VIEWPORT: split. Izquierda titular con el año en oro, resumen del año,
tres datos estructurales y la acción primaria. Derecha mosaico de fotos
reales entrando en diagonal.
FORM: extensión del mundo ya establecido; composición fijada por la
referencia que aprobó el cliente.
*/

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
            Conecta, aprende y genera oportunidades en los espacios que impulsan el sector inmobiliario.
          </p>

          <div className="mt-9">
            <Button
              size="lg"
              className="bg-white text-[#00534d] hover:bg-white/90"
              nativeButton={false}
              render={<Link href="/inscripciones/nueva" />}
            >
              Inscribirme
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
