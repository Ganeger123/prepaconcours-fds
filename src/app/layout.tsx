import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrépaConcours FDS — Préparez le concours d'entrée de la Faculté des Sciences d'Haïti",
  description: "Plateforme de préparation au concours d'entrée de la Faculté des Sciences d'Haïti. Exercices en Mathématiques, Physique, Chimie, Optique et Culture Générale avec correction automatique et assistant IA.",
  keywords: ["Haïti", "concours", "Faculté des Sciences", "mathématiques", "physique", "chimie", "optique", "examen"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
