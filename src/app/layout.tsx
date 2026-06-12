import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Parrocchia Sant'Alfonso Maria de' Liguori — Roma",
    template: "%s | Parrocchia Sant'Alfonso Maria de' Liguori",
  },
  description:
    "Sito della Parrocchia Sant'Alfonso Maria de' Liguori, Via della Giustiniana 227, Prima Porta, Roma. Orari messe, news, eventi e risorse della comunità.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
