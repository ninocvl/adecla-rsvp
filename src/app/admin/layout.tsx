import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navbar } from "@/components/shared/navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <Navbar />
      <div className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl gap-6 px-4 text-sm">
          <Link
            href="/admin"
            className="border-b-2 border-transparent py-3 font-medium hover:border-primary"
          >
            Resumen
          </Link>
          <Link
            href="/admin/inscripciones"
            className="border-b-2 border-transparent py-3 font-medium hover:border-primary"
          >
            Inscripciones
          </Link>
          <Link
            href="/admin/empresas"
            className="border-b-2 border-transparent py-3 font-medium hover:border-primary"
          >
            Empresas
          </Link>
        </nav>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
