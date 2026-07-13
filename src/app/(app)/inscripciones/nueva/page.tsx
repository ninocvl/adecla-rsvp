import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getExchangeRate,
  getWizardEvents,
} from "@/server/queries/events.queries";
import { RegistrationWizard } from "@/components/registration/registration-wizard";

export const metadata: Metadata = {
  title: "Nueva inscripción | ADECLA",
};

export default async function NuevaInscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string; fecha?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.companyId) {
    redirect("/login?callbackUrl=/inscripciones/nueva");
  }

  const [{ evento, fecha }, events, rate, company] = await Promise.all([
    searchParams,
    getWizardEvents(),
    getExchangeRate(),
    prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        legalName: true,
        rnc: true,
        contactName: true,
        email: true,
        phone: true,
        affiliationType: true,
      },
    }),
  ]);

  if (!company) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-2xl font-semibold">Nueva inscripción</h1>
      <RegistrationWizard
        events={events}
        company={company}
        rate={rate}
        initialEventSlug={evento}
        initialEventDateId={fecha}
      />
    </div>
  );
}
