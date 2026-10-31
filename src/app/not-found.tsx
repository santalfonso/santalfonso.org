import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = { title: "Pagina non trovata" };

/** 404 per indirizzi sbagliati e contenuti inesistenti, con menù e piè di pagina del sito. */
export default function NotFound() {
  return (
    <div className="site flex min-h-screen flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <section style={{ paddingTop: 64 }}>
          <div className="container-narrow">
            <span className="kicker">Errore 404</span>
            <h1 style={{ marginTop: 20 }}>Pagina non trovata</h1>
            <p className="lead" style={{ marginTop: 20 }}>
              L&apos;indirizzo potrebbe essere sbagliato, oppure la pagina è stata spostata o tolta.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
              <Link href="/" className="btn btn--primary">
                Torna alla home
              </Link>
              <Link href="/news" className="btn btn--ghost">
                Leggi le news
              </Link>
              <Link href="/lodate" className="btn btn--ghost">
                Canti
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
