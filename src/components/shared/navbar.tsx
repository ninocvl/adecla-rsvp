import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/server/actions/auth.actions";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo width={120} height={40} />
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin" />}>
                  Panel admin
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false} render={<Link href="/dashboard" />}
                >
                  Mi panel
                </Button>
              )}
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Cerrar sesión
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                Iniciar sesión
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/registro" />}>
                Inscribirme
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
