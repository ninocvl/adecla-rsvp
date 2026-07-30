import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

// Mezcla de flyers y fotos reales del torneo para que el banner del hero se
// sienta vivo, no como una portada fija. Se recorre una vez y se repite el
// mismo listado para el loop continuo (ver marquee-track en globals.css).
const MARQUEE_PHOTOS = [
  {
    src: "/images/golf-25-julio.jpg",
    alt: "Flyer: Primera Parada, Punta Espada Golf Club, 25 de julio",
  },
  {
    src: "/images/recap-golf-25jul-02.jpg",
    alt: "Foto del torneo de golf, Primera Parada",
  },
  {
    src: "/images/padel-establos.jpeg",
    alt: "Flyer: Segunda Parada, Torneo de Pádel, Los Establos Sports Complex",
  },
  {
    src: "/images/recap-golf-25jul-05.jpg",
    alt: "Foto del torneo de golf, Primera Parada",
  },
  {
    src: "/images/recap-golf-25jul-09.jpg",
    alt: "Foto del torneo de golf, Primera Parada",
  },
  {
    src: "/images/golf-05-septiembre.jpg",
    alt: "Flyer: Tercera Parada, La Cana Golf Club, 5 de septiembre",
  },
  {
    src: "/images/recap-golf-25jul-12.jpg",
    alt: "Foto del torneo de golf, Primera Parada",
  },
  {
    src: "/images/recap-golf-25jul-15.jpg",
    alt: "Foto del torneo de golf, Primera Parada",
  },
];

function HeroMarquee() {
  const photos = [...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS];
  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="marquee-track flex w-max gap-4">
        {photos.map((photo, i) => (
          <div
            key={`${photo.src}-${i}`}
            className={cn(
              "shadow-teal-hover w-[110px] shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white shadow-2xl sm:w-[130px] lg:w-[160px]",
              i % 2 === 0 ? "-rotate-2" : "rotate-2"
            )}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={160}
              height={210}
              className="h-auto w-full"
              priority={i < 3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

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
            Forma parte del ADECLA Golf Tour &amp; Pádel Tournament 2026.
            Inscríbete para los torneos de golf en Punta Espada y La Cana en
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

          <Reveal delayMs={150} className="mt-10 lg:hidden">
            <HeroMarquee />
          </Reveal>
        </div>

        <Reveal delayMs={150} className="hidden lg:block">
          <HeroMarquee />
        </Reveal>
      </div>
    </section>
  );
}
