import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Contatti" };

export default function ContattiPage() {
  return (
    <>
      <PageTitle
        kicker="Contatti"
        title={
          <>
            Siamo qui per{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ascoltarti</span>.
          </>
        }
        lead="Per prenotazioni di sacramenti, richieste di certificati o qualsiasi altra necessità, l'ufficio parrocchiale è a tua disposizione."
      />

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="info-grid">
            <div className="card">
              <span className="kicker">Recapiti</span>
              <h3 style={{ marginTop: 14, fontSize: 20 }}>
                Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori
              </h3>
              <p style={{ marginTop: 12, marginBottom: 0, lineHeight: 1.8 }}>
                Via della Giustiniana, 227
                <br />
                00188 Roma (RM)
                <br />
                <a
                  href="tel:+39063320803"
                  style={{ color: "var(--azure-deep)", fontWeight: 600 }}
                >
                  +39 06 3320803
                </a>
              </p>
            </div>
            <div className="card">
              <span className="kicker">Ufficio parrocchiale</span>
              <h3 style={{ marginTop: 14, fontSize: 20 }}>Orari di apertura</h3>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>
                    Giorni feriali
                  </span>
                  <span className="tag" style={{ background: "var(--bg-soft)" }}>
                    17:00 – 18:30
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>
                    Sabato mattina
                  </span>
                  <span className="tag" style={{ background: "var(--bg-soft)" }}>
                    momentaneamente chiuso
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card card--soft"
            style={{ marginTop: 24, padding: 32 }}
          >
            <span className="kicker" style={{ color: "var(--gold-deep)" }}>
              Sante Messe
            </span>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                { day: "Feriali (lunedì – sabato)", times: ["8:00", "18:30"] },
                {
                  day: "Domenica e festivi",
                  times: ["8:30", "10:30", "12:00", "18:30"],
                },
              ].map((row) => (
                <div
                  key={row.day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--ink)", fontSize: 15 }}>
                    {row.day}
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {row.times.map((time) => (
                      <span
                        key={time}
                        className="tag"
                        style={{ background: "var(--bg)", fontWeight: 500 }}
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
