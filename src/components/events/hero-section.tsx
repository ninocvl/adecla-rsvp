import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="overflow-hidden border-b bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div className="max-w-xl">
          <Badge variant="secondary" className="mb-4">
            Circuito deportivo ADECLA 2026
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Inscribe a tu empresa en los torneos de ADECLA
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Golf en Punta Espada y La Cana, y muy pronto pádel. Cuéntanos de
            tu empresa, elige la fecha y recibe tu proforma al instante.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="#eventos" />}>
              Ver eventos
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/registro" />}>
              Inscribir mi empresa
            </Button>
          </div>
        </div>

        <div className="relative mx-auto hidden h-[420px] w-full max-w-md lg:block">
          <div className="absolute left-0 top-6 w-[240px] -rotate-6 overflow-hidden rounded-xl border bg-white shadow-xl transition-transform duration-300 hover:-translate-y-1">
            <Image
              src="/images/golf-25-julio.jpg"
              alt="Flyer: Primera parada del torneo de golf, Punta Espada Golf Club, 25 de julio"
              width={240}
              height={300}
              className="h-auto w-full"
              priority
            />
          </div>
          <div className="absolute right-0 top-0 w-[240px] rotate-3 overflow-hidden rounded-xl border bg-white shadow-xl transition-transform duration-300 hover:-translate-y-1">
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
