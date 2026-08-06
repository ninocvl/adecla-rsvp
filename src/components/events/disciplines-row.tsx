import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EXPOCAMACOL } from "@/lib/constants";

// Dos disciplinas con foto y, al lado, el viaje a Medellín. La fila es
// asimétrica a propósito: Expocamacol no es un torneo, así que no se disfraza
// de tarjeta de torneo — ocupa el doble de ancho y va en teal, sin foto.
const DISCIPLINAS = [
  {
    href: "#eventos",
    src: "/images/categoria-golf.jpg",
    alt: "Bola y putter sobre el green",
    nombre: "Golf",
    detalle: "Dos paradas · Punta Espada y La Cana",
  },
  {
    href: "#eventos",
    src: "/images/categoria-padel.jpg",
    alt: "Pala de pádel y pelotas sobre la cancha",
    nombre: "Pádel",
    detalle: "Una parada · Los Establos, Cap Cana",
  },
];

export function DisciplinesRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {DISCIPLINAS.map((d) => (
        <Link
          key={d.nombre}
          href={d.href}
          className="shadow-teal-hover group relative aspect-[4/5] overflow-hidden rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:aspect-[3/4]"
        >
          <Image
            src={d.src}
            alt={d.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Velo para que el texto tenga contraste sobre la foto: es una
              capa funcional de legibilidad, no un degradado decorativo. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.03_200/0.85)] via-[oklch(0.22_0.03_200/0.25)] to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-heading text-xl font-medium text-white">
              {d.nombre}
            </p>
            <p className="mt-1 text-sm text-white/90">{d.detalle}</p>
          </div>
        </Link>
      ))}

      <a
        href={EXPOCAMACOL.formUrl}
        target="_blank"
        rel="noopener"
        className="shadow-teal-hover hero-teal group relative overflow-hidden rounded-xl p-5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:col-span-2 sm:aspect-auto"
      >
        <div className="grain-overlay" aria-hidden />
        <div className="relative flex h-full flex-col">
          <span className="section-rule section-rule--oro" aria-hidden />
          <p className="font-heading text-xl font-medium text-white">
            {EXPOCAMACOL.nombre}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/90">
            {EXPOCAMACOL.resumen}
          </p>
          {/* En blanco y no en oro: a 14px el oro sobre teal queda en 3.68:1
              y no alcanza AA. El oro ya marca la sección con el filete. */}
          <p className="mt-auto pt-5 text-sm font-medium text-white">
            <span className="inline-flex items-center gap-1.5">
              Reservar mi cupo del viaje
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                aria-hidden
              />
            </span>
          </p>
        </div>
      </a>
    </div>
  );
}
