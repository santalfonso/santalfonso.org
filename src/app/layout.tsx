import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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

const themeInit = `(function(){try{var t=localStorage.getItem("sa-theme");if(t==="dark"||(t===null&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
