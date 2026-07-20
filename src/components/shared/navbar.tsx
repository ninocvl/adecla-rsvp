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
        <Logo width={60} height={40} className="lg:h-14" />
        <nav className="flex items-center gap-2 sm:gap-3">
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
