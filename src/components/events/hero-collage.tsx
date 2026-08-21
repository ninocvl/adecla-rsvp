import Image from "next/image";

/**
 * La portada del hero: una sola pieza de ADECLA con fotos reales del año
 * (el torneo, el corte de cinta, la revista, los reconocimientos).
 *
 * Antes eran cuatro fotos sueltas en una cuadrícula, dos de ellas de stock.
 * La pieza ya trae su propia composición en diagonal, así que no lleva el
 * recorte que usaba la cuadrícula: le cortaría el carrito de golf de la
 * esquina. Traía además un marco blanco de 15 px por lado que se recortó:
 * dentro del hero se leía como un borde pegado. La caja respeta la
 * proporción del archivo ya recortado para que no se pierdan los trofeos de
 * la derecha ni las jugadoras de la izquierda.
 */
export function HeroCollage() {
  return (
    <div className="relative aspect-[1535/1030] overflow-hidden rounded-sm">
      <Image
        src="/images/hero-portada.jpg"
        alt="Momentos de ADECLA 2026: el torneo de golf, el corte de cinta de la feria, la revista ConstruEste y los reconocimientos del año"
        fill
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="object-cover"
        // Está sobre la línea de flotación: se precarga en vez de esperar al
        // scroll.
        priority
      />
    </div>
  );
}
