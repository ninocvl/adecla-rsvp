import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Sora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/shared/splash-screen";
import "./globals.css";

// Prueba "ADECLA Modular Experience": Sora para titulares/números/botones,
// Inter para cuerpo/formularios. Reemplaza Fraunces + Public Sans solo en
// esta rama de exploración (design/modular-experience).
const inter = Inter({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adecla-rsvp.vercel.app"),
  title: {
    default: "ADECLA | Inscripciones a eventos deportivos",
    template: "%s",
  },
  description:
    "Sistema de inscripciones de ADECLA (Asociación de Desarrolladores y Constructores Provincia La Altagracia) para su circuito de torneos de golf y pádel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${sora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashScreen />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
