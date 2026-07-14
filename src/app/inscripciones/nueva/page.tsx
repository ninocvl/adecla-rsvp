import type { Metadata } from "next";
import {
  getExchangeRate,
  getWizardEvents,
} from "@/server/queries/events.queries";
import { getActiveAffiliates } from "@/server/queries/affiliates.queries";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { RegistrationWizard } from "@/components/registration/registration-wizard";

export const metadata: Metadata = {
  title: "Inscripción | ADECLA",
};

export default async function NuevaInscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string; fecha?: string }>;
}) {
  const [{ evento, fecha }, events, rate, affiliates] = await Promise.all([
    searchParams,
    getWizardEvents(),
    getExchangeRate(),
    getActiveAffiliates(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <h1 className="mb-8 text-2xl font-semibold">Inscripción</h1>
        <RegistrationWizard
          events={events}
          affiliates={affiliates}
          rate={rate}
          initialEventSlug={evento}
          initialEventDateId={fecha}
        />
      </main>
      <Footer />
    </div>
  );
}
