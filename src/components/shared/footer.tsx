import Link from "next/link";
import { ADECLA } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="section-rule" aria-hidden />
          <p className="font-medium text-foreground">{ADECLA.nombre}</p>
          <p>{ADECLA.nombreLegal}</p>
        </div>
        <div className="sm:text-right">
          <p>{ADECLA.direccion.join(", ")}</p>
          <p>RNC: {ADECLA.rnc}</p>
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
