import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  width?: number;
  height?: number;
}

// El archivo fuente es 2250x1500px (proporción 1.5:1); estos valores por
// defecto respetan esa proporción real para que next/image no distorsione
// el logo ni dispare el warning de "width/height modified, but not the other".
export function Logo({ className, href = "/", width = 72, height = 48 }: LogoProps) {
  const img = (
    <Image
      src="/images/logo-adecla.jpg"
      alt="ADECLA — Asociación de Desarrolladores y Constructores Provincia La Altagracia"
      width={width}
      height={height}
      className={cn("h-auto w-auto object-contain", className)}
      priority
    />
  );

  if (!href) return img;
  return (
    <Link href={href} className="inline-flex items-center">
      {img}
    </Link>
  );
}
