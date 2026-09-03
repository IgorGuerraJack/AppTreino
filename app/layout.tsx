import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NavPill } from "@/components/NavPill";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

/* Uma família só, pesos 400 e 500 — nada mais (spec). Auto-hospedada no build,
   então continua carregando offline. */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Treino",
  description: "Plano de treino e registro de séries, offline.",
  applicationName: "Treino",
  appleWebApp: {
    capable: true,
    title: "Treino",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
        <NavPill />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
