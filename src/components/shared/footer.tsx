import Link from "next/link";
import { ADECLA } from "@/lib/constants";
import { IsoMark } from "@/components/shared/iso-mark";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-carbon text-white/60">
      <div className="geo-grid-bg--on-carbon absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <IsoMark tone="white" className="mb-2 h-5 w-5 text-white" />
          <p className="font-medium text-white">{ADECLA.nombre}</p>
          <p>{ADECLA.nombreLegal}</p>
        </div>
        <div className="sm:text-right">
          <p>{ADECLA.direccion.join(", ")}</p>
          <p>RNC: {ADECLA.rnc}</p>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-4 py-3 text-center">
        <Link href="/login" className="text-xs text-white/50 hover:text-white">
          Administrador
        </Link>
      </div>
    </footer>
  );
}
