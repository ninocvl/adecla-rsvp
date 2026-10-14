import Link from "next/link";
import { getStaff, pinConfigurado } from "@/lib/checkin-auth";
import { PinForm } from "@/components/checkin/pin-form";
import { Scanner } from "@/components/checkin/scanner";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const staff = await getStaff();

  if (!staff) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Check-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo para el staff del evento.
          </p>
        </div>
        {pinConfigurado() && <PinForm />}
        <p className="text-sm text-muted-foreground">
          También puedes{" "}
          <Link
            href="/login?callbackUrl=/checkin"
            className="font-medium text-primary underline underline-offset-4"
          >
            iniciar sesión como administrador
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Escanear entrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apunta la cámara al QR de la entrada.
        </p>
      </div>
      <Scanner />
    </div>
  );
}
