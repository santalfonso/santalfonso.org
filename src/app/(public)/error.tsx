"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Errore in una pagina del sito (es. database momentaneamente irraggiungibile): menù e piè di pagina restano. */
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section style={{ paddingTop: 64 }}>
      <div className="container-narrow">
        <span className="kicker">Qualcosa non ha funzionato</span>
        <h1 style={{ marginTop: 20 }}>La pagina non si è caricata</h1>
        <p className="lead" style={{ marginTop: 20 }}>
          Può essere un problema momentaneo. Riprova tra qualche istante.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
          <button type="button" className="btn btn--primary" onClick={() => retry()}>
            Riprova
          </button>
          <Link href="/" className="btn btn--ghost">
            Torna alla home
          </Link>
        </div>
      </div>
    </section>
  );
}
