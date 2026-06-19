import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AgroVerse — Cultiva y Gana",
  description: "El juego de agricultura global con recompensas en USDC. Disponible en MiniPay.",
  other: {
    "talentapp:project_verification": "62bfd20fa01eab00f30a77a1c4f343da4740b3b934d0316940003f1871fd3cf811dfb56c65810f9ebd969c9d84a8b8fe2b362954bf84b3fc6128093599811d3d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-color-scheme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full bg-stone-200 flex justify-center">
        <div className="relative w-full max-w-[430px] min-h-screen bg-[#fef9f0] shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
