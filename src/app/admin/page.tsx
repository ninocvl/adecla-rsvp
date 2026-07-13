import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel administrativo | ADECLA",
};

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Panel administrativo</h1>
      <p className="mt-2 text-muted-foreground">
        Métricas y gestión de inscripciones. (En construcción)
      </p>
    </div>
  );
}
