import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { IsoMark } from "@/components/shared/iso-mark";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-carbon">
      <div className="geo-grid-bg--on-carbon absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_8%_0%,oklch(0.5_0.116_185.9/0.35),transparent_60%)]"
        aria-hidden
      />
      <div className="grain-overlay" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6 lg:py-28">
        <div className="max-w-xl">
          <div className="mb-4 flex items-center gap-3">
            <IsoMark tone="white" className="h-6 w-6 text-white" />
            <Badge
              variant="outline"
              className="border-white/25 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm"
            >
              Punta Espada · La Cana
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Inscríbete en los torneos
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Forma parte del ADECLA Golf Tour &amp; Pádel Tournament 2026.
            Inscríbete para los torneos de golf en Punta Espada y La Cana en
            pocos minutos y recibe tu proforma de manera inmediata.
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            Las inscripciones para Pádel estarán disponibles próximamente.
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

          <Reveal
            delayMs={150}
            className="relative mt-12 flex h-[170px] justify-center lg:hidden"
          >
            <div className="module-glass-teal absolute left-1/2 top-2 h-32 w-32 -translate-x-1/2 rounded-2xl" aria-hidden />
            <div className="module-shadow absolute left-[26%] top-0 w-[130px] -rotate-1 overflow-hidden rounded-lg border-2 border-carbon bg-white sm:w-[150px]">
              <Image
                src="/images/golf-25-julio.jpg"
                alt="Flyer: Primera parada del torneo de golf, Punta Espada Golf Club, 25 de julio"
                width={150}
                height={188}
                className="h-auto w-full"
              />
            </div>
            <div className="module-shadow absolute right-[14%] top-8 w-[110px] rotate-1 overflow-hidden rounded-lg border-2 border-white bg-white sm:w-[128px]">
              <Image
                src="/images/golf-05-septiembre.jpg"
                alt="Flyer: Tercera parada del torneo de golf, La Cana Golf Club, 5 de septiembre"
                width={150}
                height={188}
                className="h-auto w-full"
              />
            </div>
          </Reveal>
        </div>

        <Reveal
          delayMs={100}
          className="relative mx-auto hidden h-[440px] w-full max-w-md lg:block"
        >
          {/* Vacío geométrico: referencia directa al negativo entre los
              bloques del isotipo, no un marco decorativo suelto. */}
          <div
            className="absolute -left-10 top-6 h-28 w-28 rounded-sm border border-white/15"
            aria-hidden
          />
          <div
            className="module-glass-blue absolute -right-4 -top-6 h-36 w-36 rounded-2xl"
            aria-hidden
          />
          <div
            className="module-glass-teal absolute bottom-8 left-0 h-44 w-44 rounded-2xl"
            aria-hidden
          />

          {/* Flyer principal: más grande, ligeramente desplazado hacia el
              borde derecho, rotación mínima. */}
          <div className="module-shadow absolute right-2 top-0 w-[250px] -rotate-2 overflow-hidden rounded-lg border-2 border-carbon bg-white">
            <Image
              src="/images/golf-05-septiembre.jpg"
              alt="Flyer: Tercera parada del torneo de golf, La Cana Golf Club, 5 de septiembre"
              width={260}
              height={325}
              className="h-auto w-full"
              priority
            />
          </div>

          {/* Segundo flyer: superpuesto sobre la esquina inferior del
              primero, como pieza ensamblada, no lado a lado. */}
          <div className="module-shadow absolute bottom-4 left-6 w-[210px] rotate-1 overflow-hidden rounded-lg border-2 border-white bg-white">
            <Image
              src="/images/golf-25-julio.jpg"
              alt="Flyer: Primera parada del torneo de golf, Punta Espada Golf Club, 25 de julio"
              width={220}
              height={275}
              className="h-auto w-full"
              priority
            />
          </div>

          <IsoMark
            tone="white"
            className="absolute -top-2 left-[38%] h-9 w-9 text-white/70"
          />
        </Reveal>
      </div>
    </section>
  );
}
