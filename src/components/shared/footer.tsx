import Link from "next/link";
import { ADECLA, REVISTA } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

// Cierre en teal profundo, como el flyer de Eventos ADECLA 2026: el pie deja
// de ser una nota al margen sobre hueso y cierra la página con el color de
// la marca. El tono es el extremo oscuro del mismo degradado del hero, así
// que no entra un verde nuevo al sistema.
const NAVEGACION = [
  { href: "/", label: "Inicio" },
  { href: "/#eventos", label: "Eventos" },
  { href: "/#expocamacol", label: "Misión Empresarial" },
  { href: "/inscripciones/nueva", label: "Inscribirme" },
];

const enlaceClase =
  "-my-1.5 inline-flex items-center py-1.5 text-white/75 transition-colors hover:text-white";

export function Footer() {
  return (
    <footer className="bg-[#00453f] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* El logotipo es PNG con transparencia y arte oscuro: sobre el teal
              se invierte a blanco, como aparece en el flyer. */}
          <Logo width={140} height={45} className="brightness-0 invert" />
          <p className="mt-4 max-w-xs text-white/75">{ADECLA.nombreLegal}</p>
        </div>

        <div>
          <p className="font-medium text-white">Navegación</p>
          <ul className="mt-3 space-y-2">
            {NAVEGACION.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={enlaceClase}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-white">Contacto</p>
          <ul className="mt-3 space-y-2 text-white/75">
            <li>{ADECLA.direccion.join(", ")}</li>
            <li>
              <a
                href={`tel:+${ADECLA.contacto.whatsapp}`}
                className={enlaceClase}
              >
                {ADECLA.contacto.telefono}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${ADECLA.contacto.email}`}
                className={enlaceClase}
              >
                {ADECLA.contacto.email}
              </a>
            </li>
            <li>RNC: {ADECLA.rnc}</li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-white">{REVISTA.nombre}</p>
          <p className="mt-3 max-w-xs text-white/75">
            La edición digital se lee en el navegador, sin descargar nada.
          </p>
          <a
            href={REVISTA.url}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center rounded-md border border-white/30 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            Leer la revista
          </a>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {ADECLA.nombre}. Todos los derechos
            reservados.
          </p>
          <Link
            href="/login"
            className="-my-1.5 inline-flex items-center px-2 py-1.5 transition-colors hover:text-white"
          >
            Administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
