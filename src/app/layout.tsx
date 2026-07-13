import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/shared/splash-screen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashScreen />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
