import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function HeroSection() {
  return (
    <section className="hero-teal relative overflow-hidden">
      <div className="grain-overlay" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div className="max-w-xl">
          <Badge
            variant="outline"
            className="mb-4 border-white/25 bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-sm"
          >
            Punta Espada · La Cana
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Inscríbete en los torneos
          </h1>
          <p className="mt-4 text-lg text-white/85">
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

          <Reveal delayMs={150} className="mt-10 flex justify-center gap-4 lg:hidden">
            <div className="shadow-teal-hover w-[130px] -rotate-3 overflow-hidden rounded-xl border border-white/20 bg-white shadow-lg sm:w-[150px]">
              <Image
                src="/images/golf-25-julio.jpg"
                alt="Flyer: Primera parada del torneo de golf, Punta Espada Golf Club, 25 de julio"
                width={150}
                height={188}
                className="h-auto w-full"
              />
            </div>
            <div className="shadow-teal-hover mt-6 w-[130px] rotate-2 overflow-hidden rounded-xl border border-white/20 bg-white shadow-lg sm:w-[150px]">
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

        <div className="relative mx-auto hidden h-[420px] w-full max-w-md lg:block">
          <div className="shadow-teal-hover absolute left-0 top-6 w-[240px] -rotate-6 overflow-hidden rounded-xl border border-white/20 bg-white shadow-2xl">
            <Image
              src="/images/golf-25-julio.jpg"
              alt="Flyer: Primera parada del torneo de golf, Punta Espada Golf Club, 25 de julio"
              width={240}
              height={300}
              className="h-auto w-full"
              priority
            />
          </div>
          <div className="shadow-teal-hover absolute right-0 top-0 w-[240px] rotate-3 overflow-hidden rounded-xl border border-white/20 bg-white shadow-2xl">
            <Image
              src="/images/golf-05-septiembre.jpg"
              alt="Flyer: Tercera parada del torneo de golf, La Cana Golf Club, 5 de septiembre"
              width={240}
              height={300}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
