import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/server/actions/auth.actions";
import { Logo } from "@/components/shared/logo";
import { AdminNavLink } from "@/components/shared/admin-nav-link";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo width={124} height={40} className="lg:h-12" />
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Anclas absolutas (/#...) y no relativas: el navbar es global, así
              que desde el wizard o el panel tienen que volver a la landing. */}
          {!isAdmin && (
            <ul className="mr-2 hidden items-center gap-5 md:flex">
              {[
                { href: "/#eventos", label: "Eventos" },
                { href: "/eventos/mision-empresarial", label: "Misión Empresarial" },
                { href: "/#revista", label: "Revista" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-foreground/80 underline-offset-8 transition-colors hover:text-foreground hover:decoration-[var(--brand-teal)] hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {isAdmin ? (
            <>
              <AdminNavLink />
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Cerrar sesión
                </Button>
              </form>
            </>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/inscripciones/nueva" />}>
              Inscribirme
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
