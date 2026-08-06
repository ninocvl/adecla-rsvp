import Image from "next/image";

// Fotos reales de la Primera Parada (25 de julio) mezcladas con las dos
// disciplinas del circuito. No es decoración de stock: la prueba de que el
// torneo existe y ya se jugó es la propia foto del torneo.
const TILES = [
  {
    src: "/images/golf-atardecer.jpg",
    alt: "Jugador de golf al atardecer en un campo del circuito",
    className: "col-span-2 row-span-2",
    priority: true,
  },
  {
    src: "/images/recap-golf-25jul-03.jpg",
    alt: "Salida desde el tee en la Primera Parada del ADECLA Golf Tour",
    className: "col-span-1 row-span-2",
    priority: true,
  },
  {
    src: "/images/categoria-padel.jpg",
    alt: "Pala y pelotas de pádel sobre la cancha",
    className: "col-span-1 row-span-1",
    priority: false,
  },
  {
    src: "/images/recap-golf-25jul-09.jpg",
    alt: "Participantes de ADECLA durante la Primera Parada en Punta Espada",
    className: "col-span-2 row-span-1",
    priority: false,
  },
];

export function HeroCollage() {
  return (
    <div className="collage-cut grid aspect-[4/3] grid-cols-3 grid-rows-3 gap-1.5 lg:aspect-[5/4]">
      {TILES.map((tile) => (
        <div
          key={tile.src}
          className={`relative overflow-hidden rounded-sm ${tile.className}`}
        >
          <Image
            src={tile.src}
            alt={tile.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
            // Las cuatro piezas están sobre la línea de flotación, así que
            // ninguna debe esperar al IntersectionObserver: las dos grandes
            // van con priority (precarga) y las dos chicas en eager.
            priority={tile.priority}
            loading={tile.priority ? undefined : "eager"}
          />
        </div>
      ))}
    </div>
  );
}
