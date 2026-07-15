import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex flex-col items-center border-b bg-white py-5">
        <Logo />
        <span className="section-rule mt-3" aria-hidden />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Volver al inicio
        </Link>
      </footer>
    </div>
  );
}
