import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, href = "/", width = 140, height = 48 }: LogoProps) {
  const img = (
    <Image
      src="/images/logo-adecla.jpg"
      alt="ADECLA — Asociación de Desarrolladores y Constructores Provincia La Altagracia"
      width={width}
      height={height}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ maxWidth: width, maxHeight: height }}
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
