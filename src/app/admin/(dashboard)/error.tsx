"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Errore in una pagina dell'amministrazione: l'intestazione dell'admin resta. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="admin-page-head">
        <h1>Qualcosa non ha funzionato</h1>
      </div>
      <div className="admin-error" style={{ marginBottom: 20 }}>
        L&apos;operazione o il caricamento della pagina non sono riusciti. Può essere un problema momentaneo: riprova.
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => retry()}>
          Riprova
        </button>
        <Link href="/admin" className="admin-btn">
          Torna alla dashboard
        </Link>
      </div>
    </>
  );
}
