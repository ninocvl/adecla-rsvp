import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { puedeEditar } from "@/lib/permissions";
import { getActiveAffiliates } from "@/server/queries/affiliates.queries";
import { NuevaEntradaForm } from "@/components/admin/nueva-entrada-form";

export const metadata: Metadata = { title: "Nueva entrada | Admin ADECLA" };
export const dynamic = "force-dynamic";

export default async function NuevaEntradaPage() {
  const session = await auth();
  if (!puedeEditar(session?.user?.role)) redirect("/admin/entradas");

  const afiliados = await getActiveAffiliates();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/entradas" className="text-sm text-muted-foreground hover:text-foreground">
          ← Entradas
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Nueva entrada</h1>
        <p className="mt-1 text-muted-foreground">
          Al crearla se genera el PDF con el QR y se envía por correo.
        </p>
      </div>
      <NuevaEntradaForm
        afiliados={afiliados.map((a) => ({ id: a.id, name: a.name, email: a.email }))}
      />
    </div>
  );
}
