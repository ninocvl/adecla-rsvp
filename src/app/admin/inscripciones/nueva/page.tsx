import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getExchangeRate,
  getWizardEvents,
} from "@/server/queries/events.queries";
import { getActiveAffiliates } from "@/server/queries/affiliates.queries";
import { auth } from "@/auth";
import { puedeEditar } from "@/lib/permissions";
import { RegistrationWizard } from "@/components/registration/registration-wizard";

export const metadata: Metadata = {
  title: "Nueva inscripción | Admin ADECLA",
};

export const dynamic = "force-dynamic";

/**
 * Inscribir a alguien desde el panel, para quien pide el cupo por WhatsApp
 * o por teléfono.
 *
 * Usa el mismo formulario que el público en vez de uno propio: así el cupo,
 * el correlativo, la proforma y el cupón de pareja gratis siguen calculándose
 * en un solo sitio. Un formulario aparte para el admin sería una segunda
 * versión de esas reglas, y la que se olvidaría de actualizar.
 */
export default async function AdminNuevaInscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string; fecha?: string }>;
}) {
  const session = await auth();
  // El rol de solo lectura no inscribe a nadie.
  if (!puedeEditar(session?.user?.role)) {
    redirect("/admin/inscripciones");
  }

  const [{ evento, fecha }, events, rate, affiliates] = await Promise.all([
    searchParams,
    getWizardEvents(),
    getExchangeRate(),
    getActiveAffiliates(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin/inscripciones"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Inscripciones
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Nueva inscripción</h1>
        <p className="mt-1 text-muted-foreground">
          La misma que llena el público. Los correos de confirmación y la
          proforma salen igual, así que usa el correo real de la persona.
        </p>
      </div>

      <RegistrationWizard
        events={events}
        affiliates={affiliates}
        rate={rate}
        initialEventSlug={evento}
        initialEventDateId={fecha}
      />
    </div>
  );
}
