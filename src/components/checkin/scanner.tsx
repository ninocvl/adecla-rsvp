"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { normalizarCodigo } from "@/lib/entradas";
import { Input } from "@/components/ui/input";

/**
 * Escáner por cámara: pinta cada cuadro del video en un canvas y se lo pasa a
 * jsQR. Funciona igual en iPhone y Android sin depender de BarcodeDetector.
 * El campo de abajo es el respaldo cuando la cámara no abre o el QR no se lee.
 */
export function Scanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const [camara, setCamara] = useState<"iniciando" | "activa" | "error">("iniciando");
  const [manual, setManual] = useState("");
  const [errorManual, setErrorManual] = useState<string | null>(null);

  useEffect(() => {
    let detenido = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    async function iniciar() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (detenido || !video.current) return;
        video.current.srcObject = stream;
        await video.current.play();
        setCamara("activa");
        leer();
      } catch {
        if (!detenido) setCamara("error");
      }
    }

    function leer() {
      const v = video.current;
      if (detenido || !v || !ctx) return;
      if (v.readyState === v.HAVE_ENOUGH_DATA && v.videoWidth > 0) {
        // Reducir el cuadro acelera el decodificado sin perder QR a distancia
        // de puerta.
        const escala = Math.min(1, 640 / v.videoWidth);
        canvas.width = Math.round(v.videoWidth * escala);
        canvas.height = Math.round(v.videoHeight * escala);
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(img.data, img.width, img.height, {
          inversionAttempts: "dontInvert",
        });
        const codigo = qr ? normalizarCodigo(qr.data) : null;
        if (codigo) {
          detenido = true;
          router.push(`/checkin/${codigo}`);
          return;
        }
      }
      raf = requestAnimationFrame(leer);
    }

    iniciar();
    return () => {
      detenido = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [router]);

  function buscarManual(e: React.FormEvent) {
    e.preventDefault();
    const codigo = normalizarCodigo(manual);
    if (!codigo) {
      setErrorManual("El código tiene 8 caracteres, por ejemplo K7M3-QX9A.");
      return;
    }
    setErrorManual(null);
    router.push(`/checkin/${codigo}`);
  }

  return (
    <div className="space-y-5">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
        <video
          ref={video}
          playsInline
          muted
          className="size-full object-cover"
        />
        {camara !== "activa" && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
            {camara === "iniciando"
              ? "Abriendo la cámara…"
              : "No pudimos abrir la cámara. Revisa el permiso del navegador o escribe el código abajo."}
          </p>
        )}
        {camara === "activa" && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-white/80"
          />
        )}
      </div>

      <form onSubmit={buscarManual} className="space-y-2">
        <label htmlFor="codigo" className="text-sm font-medium">
          ¿No lee el QR? Escribe el código
        </label>
        <div className="flex gap-2">
          <Input
            id="codigo"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="XXXX-XXXX"
            autoCapitalize="characters"
            autoComplete="off"
            className="h-12 font-mono text-lg uppercase"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-xl bg-primary px-5 font-semibold text-primary-foreground"
          >
            Buscar
          </button>
        </div>
        {errorManual && (
          <p className="text-sm text-destructive">{errorManual}</p>
        )}
      </form>
    </div>
  );
}
