import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Check-in | ADECLA",
  robots: { index: false, follow: false },
};

// Pensado para el celular del staff en la puerta: una columna angosta, sin
// el navbar del sitio.
export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="flex justify-center border-b bg-white py-3">
        <Logo width={110} height={36} />
      </header>
      <main className="mx-auto w-full max-w-md px-4 py-6">{children}</main>
    </div>
  );
}
