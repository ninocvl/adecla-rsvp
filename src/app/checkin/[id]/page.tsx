import Link from "next/link";
import { getStaff, pinConfigurado } from "@/lib/checkin-auth";
import { formatearCodigo, normalizarCodigo } from "@/lib/entradas";
import { getEntrada } from "@/server/queries/entradas.queries";
import { CheckinPanel } from "@/components/checkin/checkin-panel";
import { PinForm } from "@/components/checkin/pin-form";

export const dynamic = "force-dynamic";

export default async function CheckinEntradaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: crudo } = await params;
  const staff = await getStaff();

  // Quien escanea su propio QR sin ser staff no aprende nada de la entrada:
  // ni si existe, ni a nombre de quién está, ni cuántos cupos tiene.
  if (!staff) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-2xl border bg-white p-8">
          <h1 className="text-2xl font-semibold">Presenta este código en la entrada</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            El personal de ADECLA lo valida con su celular. No hace falta que
            hagas nada más aquí.
          </p>
        </div>
        {pinConfigurado() && (
          <details className="rounded-xl border bg-white p-4 text-left">
            <summary className="cursor-pointer text-sm font-medium">
              Soy staff del evento
            </summary>
            <div className="mt-4">
              <PinForm />
            </div>
          </details>
        )}
      </div>
    );
  }

  const id = normalizarCodigo(crudo);
  const entrada = id ? await getEntrada(id) : null;

  if (!entrada) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-5">
          <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
            No existe
          </span>
          <p className="mt-3 text-xl font-semibold">Código no encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ese código no corresponde a ninguna entrada. No dejes pasar a nadie
            con él y revisa que esté bien escrito.
          </p>
        </div>
        <Link
          href="/checkin"
          className="flex h-12 items-center justify-center rounded-xl border-2 font-semibold"
        >
          Escanear otra
        </Link>
      </div>
    );
  }

  const ultimo = entrada.ingresos.find((i) => !i.revertidoAt);

  return (
    <div className="space-y-4">
      <CheckinPanel
        puedeMarcar={staff.puedeMarcar}
        entrada={{
          id: entrada.id,
          codigo: formatearCodigo(entrada.id),
          nombre: entrada.nombreTitular,
          tipo: entrada.tipoTitular,
          cupos: entrada.cupos,
          ingresados: entrada.ingresados,
          anulada: entrada.anulada,
          ultimoIngresoAt: ultimo ? ultimo.createdAt.toISOString() : null,
        }}
      />
      <Link
        href="/checkin"
        className="flex h-12 items-center justify-center rounded-xl bg-foreground font-semibold text-background"
      >
        Escanear otra
      </Link>
    </div>
  );
}
