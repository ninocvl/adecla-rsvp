"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Las 3 paradas reales del circuito, no fotos sueltas del recap: el hero
// promete el circuito completo, la galería "Así se vivió" de cada tarjeta
// es donde se demuestra cómo fue de verdad. Nunca mezclar los dos roles.
const CIRCUIT_STOPS = [
  {
    src: "/images/golf-25-julio.jpg",
    alt: "Flyer: Primera Parada, Punta Espada Golf Club, 25 de julio",
    label: "Primera Parada",
    meta: "25 de julio · Punta Espada Golf Club",
  },
  {
    src: "/images/padel-establos.jpeg",
    alt: "Flyer: Segunda Parada, Torneo de Pádel, Los Establos Sports Complex",
    label: "Segunda Parada",
    meta: "14-15 de agosto · Los Establos",
  },
  {
    src: "/images/golf-05-septiembre.jpg",
    alt: "Flyer: Tercera Parada, La Cana Golf Club, 5 de septiembre",
    label: "Tercera Parada",
    meta: "5 de septiembre · La Cana Golf Club",
  },
];

export function HeroCircuitCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      setActive((i) => (i + 1) % CIRCUIT_STOPS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:max-w-[280px] lg:max-w-[320px]">
      {CIRCUIT_STOPS.map((stop, i) => (
        <Image
          key={stop.src}
          src={stop.src}
          alt={stop.alt}
          fill
          sizes="320px"
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
          priority={i === 0}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
          {CIRCUIT_STOPS[active].label}
        </p>
        <p className="text-sm font-medium text-white">
          {CIRCUIT_STOPS[active].meta}
        </p>
      </div>
      <div
        className="absolute right-3 top-3 flex gap-1.5"
        role="tablist"
        aria-label="Paradas del circuito"
      >
        {CIRCUIT_STOPS.map((stop, i) => (
          <button
            key={stop.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={stop.label}
            onClick={() => setActive(i)}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              i === active ? "bg-white" : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
