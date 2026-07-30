import { cn } from "@/lib/utils";

const STEPS = ["Evento", "Empresa", "Participantes", "Resumen", "Confirmación"];

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Progreso de la inscripción">
      {STEPS.map((label, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "pending";
        return (
          <li
            key={label}
            className="flex flex-1 flex-col items-center gap-1.5"
            aria-current={state === "current" ? "step" : undefined}
          >
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-0.5 flex-1",
                  index === 0
                    ? "bg-transparent"
                    : state === "pending"
                      ? "bg-border"
                      : "bg-primary"
                )}
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  state === "done" && "border-primary bg-primary text-primary-foreground",
                  state === "current" && "border-primary text-primary",
                  state === "pending" && "border-border text-muted-foreground"
                )}
              >
                {state === "done" ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <div
                className={cn(
                  "h-0.5 flex-1",
                  index === STEPS.length - 1
                    ? "bg-transparent"
                    : state === "done"
                      ? "bg-primary"
                      : "bg-border"
                )}
              />
            </div>
            <span
              className={cn(
                "hidden text-xs sm:block",
                state === "current"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
