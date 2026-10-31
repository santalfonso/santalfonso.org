"use client";

/** Ultima rete di sicurezza (errore nel layout principale): pagina autonoma, senza stili del sito. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fff",
          color: "#0F1419",
          padding: 24,
        }}
      >
        <title>Errore | Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori</title>
        <main style={{ maxWidth: 520, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>Il sito non si è caricato</h1>
          <p style={{ color: "#4A5160", lineHeight: 1.6, margin: "0 0 24px" }}>
            Può essere un problema momentaneo. Riprova tra qualche istante.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              border: 0,
              background: "#1F7AE0",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Riprova
          </button>
        </main>
      </body>
    </html>
  );
}
