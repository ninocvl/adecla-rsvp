import Link from "next/link";
import { ADECLA } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-sm text-muted-foreground sm:grid-cols-3">
        <div>
          <Logo width={140} height={45} />
          <p className="mt-4 max-w-xs">{ADECLA.nombreLegal}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Navegación</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/#eventos" className="hover:text-foreground">
                Eventos
              </Link>
            </li>
            <li>
              <Link
                href="/inscripciones/nueva"
                className="hover:text-foreground"
              >
                Inscribirme
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Contacto</p>
          <ul className="mt-3 space-y-2">
            <li>{ADECLA.direccion.join(", ")}</li>
            <li>
              <a
                href={`tel:+${ADECLA.contacto.whatsapp}`}
                className="hover:text-foreground"
              >
                {ADECLA.contacto.telefono}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${ADECLA.contacto.email}`}
                className="hover:text-foreground"
              >
                {ADECLA.contacto.email}
              </a>
            </li>
            <li>RNC: {ADECLA.rnc}</li>
          </ul>
        </div>
      </div>
      <div className="border-t px-4 py-3 text-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Administrador
        </Link>
      </div>
    </footer>
  );
}
