import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCompanyRegistrations } from "@/server/queries/registrations.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationCard } from "@/components/registration/registration-card";

export const metadata: Metadata = {
  title: "Mi panel | ADECLA",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.companyId) {
    redirect("/login");
  }

  const registrations = await getCompanyRegistrations(session.user.companyId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Hola, {session.user.companyName ?? session.user.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aquí están las inscripciones de tu empresa.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/inscripciones/nueva" />}>
          Nueva inscripción
        </Button>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <p className="text-lg font-medium">Aún no tienes inscripciones</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Inscribe a tu empresa en el torneo de golf: elige la fecha,
              registra a tus jugadores y descarga la proforma.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/inscripciones/nueva" />}
            >
              Crear mi primera inscripción
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {registrations.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
            />
          ))}
        </div>
      )}
    </div>
  );
}
