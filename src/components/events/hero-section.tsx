import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { HeroCircuitCarousel } from "./hero-circuit-carousel";

export function HeroSection() {
  return (
    <section className="hero-teal relative overflow-hidden">
      <div className="grain-overlay" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Inscríbete en los torneos
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Forma parte del ADECLA Golf Tour &amp; Pádel Tournament 2026: tres
            paradas en Punta Espada, Los Establos y La Cana. Inscríbete en
            pocos minutos y recibe tu proforma de manera inmediata.
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            Pádel ya abrió inscripciones: 14 y 15 de agosto en Los Establos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-[#00534d] hover:bg-white/90"
              nativeButton={false}
              render={<Link href="#eventos" />}
            >
              Ver eventos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="/inscripciones/nueva" />}
            >
              Inscribir
            </Button>
          </div>

          <Reveal delayMs={150} className="mt-10 max-w-[240px] lg:hidden">
            <HeroCircuitCarousel />
          </Reveal>
        </div>

        <Reveal delayMs={150} className="hidden lg:block">
          <HeroCircuitCarousel />
        </Reveal>
      </div>
    </section>
  );
}
