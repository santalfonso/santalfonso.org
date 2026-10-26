import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import PageTitle from "@/components/PageTitle";
import LodateSidebar from "@/components/lodate/LodateSidebar";
import "@/app/lodate.css";

export const metadata: Metadata = {
  title: {
    default: "Lodate, lodate Iddio",
    template: "%s — Lodate, lodate Iddio",
  },
  description:
    "Canti per cantori e cori nella Messa: testi con accordi, scalette e letture del giorno. Parrocchia Sant'Alfonso Maria de' Liguori, Roma.",
};

export default async function LodateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const loggedIn = !!session?.user?.id;

  return (
    <div className="lodate">
      <PageTitle
        kicker="Canti per la liturgia"
        title="Lodate, lodate Iddio"
      />
      <div className="container lodate-shell">
        <Suspense fallback={<aside className="lodate-side" aria-label="Menù dei canti" />}>
          <LodateSidebar loggedIn={loggedIn} />
        </Suspense>
        <div className="lodate-main">{children}</div>
      </div>
    </div>
  );
}
