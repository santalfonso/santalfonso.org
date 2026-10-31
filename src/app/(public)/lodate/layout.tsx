import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import LodateSidebar from "@/components/lodate/LodateSidebar";
import ParishEpigraph from "@/components/parrocchia/ParishEpigraph";
import "@/app/lodate.css";
import "@/app/parrocchia.css";

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
      {/* Titolo a sinistra e citazione del Salmo a destra, allineati alla pagina larga */}
      <section className="lodate-head">
        <div className="container lodate-head__inner">
          <div>
            <span className="kicker">Canti per la liturgia</span>
            <h1 style={{ marginTop: 20 }}>
              Lodate, lodate{" "}
              <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Iddio</span>
            </h1>
          </div>
          <ParishEpigraph reference="cfr. Salmo 150">
            Lodatelo sui cembali sonori,
            <br />
            lodatelo sui cembali squillanti:
            <br />
            Ogni vivente celebri il Signore,
            <br />
            lodate, lodate Iddio.
          </ParishEpigraph>
        </div>
      </section>
      <div className="container lodate-shell">
        <Suspense fallback={<aside className="lodate-side" aria-label="Menù dei canti" />}>
          <LodateSidebar loggedIn={loggedIn} />
        </Suspense>
        <div className="lodate-main">{children}</div>
      </div>
    </div>
  );
}
