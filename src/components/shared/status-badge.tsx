import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PROFORMA_GENERADA: "bg-slate-100 text-slate-700 border-slate-200",
  PENDIENTE_PAGO: "bg-amber-100 text-amber-800 border-amber-200",
  EN_REVISION: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMADA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELADA: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
