import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ValentinaWhatsAppCta } from "@/components/brand/valentina-whatsapp-cta";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agentefactory.pro"),
  title: {
    default: "AgenteFactory",
    template: "%s | AgenteFactory",
  },
  description:
    "Sesión gratuita de IA para tu negocio: 25 minutos con Alejandro Bermúdez y una recomendación por escrito para decidir qué probar primero.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <ValentinaWhatsAppCta />
      </body>
    </html>
  );
}
