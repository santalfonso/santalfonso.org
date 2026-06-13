import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Dove siamo" };

export default function DoveSiamoPage() {
  return (
    <>
      <PageTitle
        kicker="Dove siamo"
        title={
          <>
            Nel cuore di{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Prima Porta</span>,
            Roma.
          </>
        }
        lead="Via della Giustiniana, 227 — 00188 Roma (RM). La parrocchia è ben collegata a piedi, con i mezzi pubblici e in auto."
      />

      <section style={{ padding: 0 }}>
        <div className="container">
          <div
            style={{
              overflow: "hidden",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--rule)",
            }}
          >
            <iframe
              title="Mappa della parrocchia"
              src="https://www.google.com/maps?q=Via+della+Giustiniana+227,+00188+Roma&output=embed"
              style={{ width: "100%", height: 420, border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="cats">
            {[
              {
                title: "A piedi",
                body: "Dalla stazione Giustiniana della ferrovia Roma–Viterbo si raggiunge la chiesa percorrendo via della Giustiniana in circa 15 minuti.",
              },
              {
                title: "Con i mezzi pubblici",
                body: "Il quartiere è ben collegato dalla ferrovia Roma–Viterbo. Le linee bus 033, 303 e 037 servono la zona dalle stazioni di Prima Porta e Giustiniana.",
              },
              {
                title: "In auto",
                body: "Siamo collegati con due strade principali di Roma: la Flaminia e la Cassia Veientana, entrambe con accesso diretto a via della Giustiniana.",
              },
              {
                title: "Cappella Santa Elisabetta",
                body: "In via di Santa Cornelia, a servizio di Quarto Casale. Messa domenicale alle 11:00; la seconda domenica del mese alle 12:00, presieduta dal parroco.",
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <h4 style={{ fontSize: 17 }}>{item.title}</h4>
                <p style={{ marginTop: 8, fontSize: 14, marginBottom: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
