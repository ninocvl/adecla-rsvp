import Image from "next/image";
import Link from "next/link";
import { EXPOCAMACOL } from "@/lib/constants";

// Las tres se presentan igual: foto, velo y rótulo abajo. Antes la misión
// empresarial era un bloque de teal sin foto y del doble de ancho, así que
// se leía como un anuncio pegado y no como parte de la fila.
const EVENTOS = [
  {
    href: "#eventos",
    externo: false,
    src: "/images/categoria-golf.jpg",
    alt: "Bola y putter sobre el green",
    nombre: "Golf",
    detalle: "Dos torneos · Punta Espada y La Cana",
  },
  {
    href: "#eventos",
    externo: false,
    src: "/images/categoria-padel.jpg",
    alt: "Pala de pádel y pelotas sobre la cancha",
    nombre: "Pádel",
    detalle: "Un torneo · Los Establos, Cap Cana",
  },
  {
    href: EXPOCAMACOL.formUrl,
    externo: true,
    src: EXPOCAMACOL.flyer,
    alt: "Flyer de la Misión Empresarial a Medellín",
    nombre: EXPOCAMACOL.nombre,
    detalle: `${EXPOCAMACOL.fechas} · ${EXPOCAMACOL.lugar}`,
  },
];

const claseTarjeta =
  "shadow-teal-hover group relative aspect-[4/5] w-[248px] shrink-0 snap-start overflow-hidden rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:w-[272px]";

export function DisciplinesRow() {
  return (
    // Fila desplazable: con tres tarjetas entra completa en escritorio, y en
    // móvil se arrastra en vez de apilarse y estirar la página.
    <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
      {EVENTOS.map((e) => {
        const contenido = (
          <>
            <Image
              src={e.src}
              alt={e.alt}
              fill
              sizes="272px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            {/* Velo funcional de legibilidad, no un degradado decorativo. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.03_200/0.88)] via-[oklch(0.22_0.03_200/0.3)] to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-heading text-xl font-medium text-white">
                {e.nombre}
              </p>
              <p className="mt-1 text-sm text-white/90">{e.detalle}</p>
            </div>
          </>
        );

        return (
          <li key={e.nombre} className="contents">
            {e.externo ? (
              <a
                href={e.href}
                target="_blank"
                rel="noopener"
                className={claseTarjeta}
              >
                {contenido}
              </a>
            ) : (
              <Link href={e.href} className={claseTarjeta}>
                {contenido}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
