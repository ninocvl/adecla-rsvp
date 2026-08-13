"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
  label: string;
  href: string;
  active: boolean;
}

interface FilterMenuProps {
  /** La dimensión: "Estado", "Categoría". Va siempre visible en el disparador. */
  label: string;
  /** Lo elegido ahora mismo, para leerlo sin abrir el menú. */
  value: string;
  options: FilterOption[];
  active: boolean;
}

/**
 * Un filtro del panel, plegado en un menú.
 *
 * Antes cada dimensión desplegaba todas sus opciones como fichas en su propia
 * fila: cuatro filas y dieciséis fichas para elegir, en la práctica, cuatro
 * cosas. El menú deja una sola línea de controles y el disparador dice qué
 * está aplicado, que es lo único que hace falta saber de un vistazo.
 */
export function FilterMenu({ label, value, options, active }: FilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          active
            ? "border-primary bg-secondary/50 text-foreground"
            : "border-input bg-white text-muted-foreground hover:border-primary/40"
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "font-medium",
            active ? "text-primary" : "text-foreground"
          )}
        >
          {value}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.href}
            // El menú navega: cada opción es un enlace de verdad, así se puede
            // abrir en otra pestaña o guardar el enlace de una categoría.
            render={<Link href={o.href} />}
            className={cn("px-2 py-1.5", o.active && "font-medium text-primary")}
          >
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
