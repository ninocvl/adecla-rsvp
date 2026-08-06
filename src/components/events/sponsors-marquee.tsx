const TIRA = "/images/patrocinadores-tira.webp";
// Cantidad de logos que trae la tira. La lámina original completa se
// conserva en public/images/patrocinadores.jpeg como respaldo.
const TOTAL_LOGOS = 57;

// Franja continua en vez de la lámina en bloque: son 57 logos y en una
// tarjeta estática no se leía ninguno.
//
// Los 57 logos van en una sola imagen (public/images/patrocinadores-tira.webp,
// 123 KB) y no en 57 etiquetas: con la pista duplicada serían 114 peticiones
// de imagen para una sección decorativa. La tira ya viene al tamaño exacto y
// comprimida, así que se sirve directa sin pasar por el optimizador.
//
// La pista se duplica y se desplaza justo el 50%, así el primer clon queda
// donde estaba el original y el bucle no salta. La animación vive en
// globals.css (.marquee-track) para poder anularla con prefers-reduced-motion.
export function SponsorsMarquee() {
  return (
    <div className="marquee relative overflow-hidden py-2">
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map((i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={i}
            src={TIRA}
            alt=""
            aria-hidden
            width={12225}
            height={112}
            decoding="async"
            className="h-14 w-auto max-w-none shrink-0 pr-14 sm:h-16"
          />
        ))}
      </div>
      {/* La lista real, para lectores de pantalla y para que los nombres
          existan en el HTML aunque la franja sea una sola imagen. */}
      <p className="sr-only">
        Patrocinadores de los eventos ADECLA 2026: {TOTAL_LOGOS} empresas
        aliadas.
      </p>
    </div>
  );
}
