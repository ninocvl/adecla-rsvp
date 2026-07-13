import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Mi panel | ADECLA",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Bienvenido, {session?.user?.companyName ?? session?.user?.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Aquí verás tus inscripciones. (En construcción)
      </p>
    </div>
  );
}
