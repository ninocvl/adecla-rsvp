"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STORAGE_KEY = "adecla-splash-shown";
const VISIBLE_MS = 1600;
const FADE_MS = 500;

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      // sessionStorage solo existe en el cliente: el estado inicial del server
      // debe ser "visible" y aquí se corrige en cuanto hidrata.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("gone");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      const t = setTimeout(() => setPhase("gone"), 800);
      return () => clearTimeout(t);
    }

    const leave = setTimeout(() => setPhase("leaving"), VISIBLE_MS);
    const gone = setTimeout(() => setPhase("gone"), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-500 ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="splash-logo">
        <Image
          src="/images/logo-adecla.jpg"
          alt=""
          width={260}
          height={90}
          className="h-auto w-[220px] object-contain sm:w-[260px]"
          priority
        />
      </div>
      <div
        className="size-6 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
        role="presentation"
      />
    </div>
  );
}
