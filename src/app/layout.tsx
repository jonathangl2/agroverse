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
  description: "El juego de agricultura colombiana con recompensas en USDT. Disponible en MiniPay.",
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
