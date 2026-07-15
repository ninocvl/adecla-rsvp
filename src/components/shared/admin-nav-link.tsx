"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminNavLink() {
  const pathname = usePathname();
  const isActive = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      className={cn(
        "relative after:absolute after:-bottom-1 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary after:transition-opacity",
        isActive ? "after:opacity-100" : "after:opacity-0",
      )}
      render={<Link href="/admin" />}
    >
      Panel admin
    </Button>
  );
}
