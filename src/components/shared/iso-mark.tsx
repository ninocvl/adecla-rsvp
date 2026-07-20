import { cn } from "@/lib/utils";

// Motivo gráfico recurrente inspirado en la construcción por bloques del
// isotipo de ADECLA (4 rectángulos escalonados con separación). Se usa como
// acento geométrico repetible en toda la exploración "Modular Experience",
// nunca como decoración aislada sin relación con la marca.
export function IsoMark({
  className,
  tone = "teal",
}: {
  className?: string;
  tone?: "teal" | "white" | "carbon";
}) {
  const fill =
    tone === "white"
      ? "currentColor"
      : tone === "carbon"
        ? "var(--carbon)"
        : "var(--brand-teal)";
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-6 w-6", className)}
      aria-hidden
    >
      <rect x="2" y="2" width="16" height="7" fill={fill} />
      <rect x="21" y="2" width="7" height="16" fill={fill} />
      <rect x="2" y="12" width="7" height="16" fill={fill} />
      <rect x="12" y="21" width="16" height="7" fill={fill} />
    </svg>
  );
}
