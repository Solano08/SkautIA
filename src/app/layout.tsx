import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Skaut IA — Inteligencia de Inversión Colombia",
  description:
    "Agente de IA que analiza métricas nacionales y encuentra las mejores oportunidades de inversión y negocio en Colombia.",
  keywords: ["inversión", "Colombia", "IA", "negocios", "análisis", "Skaut"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Adelanta el handshake TLS con Mapbox: estilo, teselas y telemetría. */}
        <link rel="preconnect" href="https://api.mapbox.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://events.mapbox.com" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
