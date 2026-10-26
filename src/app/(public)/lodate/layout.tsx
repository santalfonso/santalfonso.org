import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import CatalogSubnav from "@/components/lodate/CatalogSubnav";
import LodateLogo from "@/components/lodate/LodateLogo";
import "@/app/lodate.css";

export const metadata: Metadata = {
  title: {
    default: "Lodate, lodate Iddio",
    template: "%s — Lodate, lodate Iddio",
  },
  description:
    "Canti per cantori e cori nella Messa: testi con accordi, scalette e letture del giorno. Parrocchia Sant'Alfonso Maria de' Liguori, Roma.",
  icons: {
    icon: [
      { url: "/lodate/icon.svg", type: "image/svg+xml" },
      { url: "/lodate/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/lodate/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/lodate/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function LodateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const loggedIn = !!session?.user?.id;

  return (
    <div className="lodate">
      <div className="lodate-head">
        <div className="container lodate-head__inner">
          <Link href="/lodate" className="lodate-brand">
            <LodateLogo className="lodate-brand__logo" />
          </Link>
          <CatalogSubnav loggedIn={loggedIn} />
        </div>
      </div>
      {children}
    </div>
  );
}
