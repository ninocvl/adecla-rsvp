"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const ROTATIONS = ["rotate-[-8deg]", "rotate-[5deg]", "rotate-[-4deg]", "rotate-[7deg]"];
const LIFTS = ["-translate-y-0.5", "translate-y-1", "-translate-y-1", "translate-y-0.5"];

export function EventRecapGallery({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, prev, next]);

  if (photos.length === 0) return null;
  const preview = photos.slice(0, 4);

  return (
    <>
      <div className="border-t pt-3">
        <div className="flex items-center gap-0">
          {preview.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              className={`relative w-14 shrink-0 border-[3px] border-white bg-white shadow-md transition-transform duration-300 ease-out hover:z-10 hover:-translate-y-1.5 hover:rotate-0 focus-visible:z-10 focus-visible:-translate-y-1.5 focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none ${i > 0 ? "-ml-5" : ""} ${ROTATIONS[i]} ${LIFTS[i]}`}
              aria-label={`Ver foto ${i + 1} del torneo`}
            >
              <span className="relative block aspect-[3/4]">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setOpen(true);
            }}
            className="-my-1.5 ml-4 inline-flex items-center py-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Ver las {photos.length} fotos
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#233738]/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galería del torneo"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar galería"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:left-4"
            aria-label="Foto anterior"
          >
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            className="relative max-h-[85vh] w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-md">
              <Image
                key={photos[index]}
                src={photos[index]}
                alt={`Foto ${index + 1} del torneo`}
                fill
                sizes="400px"
                className="recap-fade object-cover"
                priority
              />
            </span>
            <p className="mt-3 text-center text-sm text-white/70">
              {index + 1} / {photos.length}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:right-4"
            aria-label="Foto siguiente"
          >
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          </div>,
          document.body
        )}
    </>
  );
}
