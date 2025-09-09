import type { Metadata } from "next";
import { Inter, Inria_Serif, Merriweather } from "next/font/google";
import "./globals.css";

// Fontes do Figma conforme especificado no plano
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const inriaSerif = Inria_Serif({
  variable: "--font-inria-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Veritas - Automatize a verificação de fatos",
  description: "Plataforma de verificação de fatos automatizada usando IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${inriaSerif.variable} ${merriweather.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

