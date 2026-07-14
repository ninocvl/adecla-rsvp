import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            Circuito deportivo ADECLA 2026
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Inscribe a tu empresa en los torneos de ADECLA
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Golf en Punta Espada y La Cana, y muy pronto pádel. Cuéntanos de
            tu empresa, elige la fecha y recibe tu proforma al instante.
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
              render={<Link href="/registro" />}
            >
              Inscribir mi empresa
            </Button>
          </div>
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
