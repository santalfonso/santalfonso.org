import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Dove siamo" };

export default function DoveSiamoPage() {
  return (
    <>
      <PageTitle
        title="Dove siamo"
        subtitle="Via della Giustiniana, 227 — 00188 Roma (RM)"
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="overflow-hidden rounded-lg border border-stone-200 shadow-sm">
          <iframe
            title="Mappa della parrocchia"
            src="https://www.google.com/maps?q=Via+della+Giustiniana+227,+00188+Roma&output=embed"
            className="h-96 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="prose-parish mt-10">
          <p>
            La parrocchia è situata in via della Giustiniana 227, nel quartiere
            di Prima Porta a Roma, ed è raggiungibile in diversi modi.
          </p>

          <h2>A piedi</h2>
          <p>
            Dalla stazione Giustiniana della ferrovia Roma–Viterbo si raggiunge
            la chiesa percorrendo via della Giustiniana in circa 15 minuti.
          </p>

          <h2>Con i mezzi pubblici</h2>
          <p>
            Il nostro quartiere è ben collegato dalla ferrovia Roma–Viterbo. Le
            linee bus 033, 303 e 037 servono la zona dalle stazioni di Prima
            Porta e Giustiniana.
          </p>

          <h2>In auto</h2>
          <p>
            Siamo ben collegati con due strade principali di Roma: la Flaminia e
            la Cassia Veientana, entrambe con accesso diretto a via della
            Giustiniana.
          </p>

          <h2>Cappella Santa Elisabetta</h2>
          <p>
            Un ulteriore luogo di culto si trova in via di Santa Cornelia, a
            servizio della zona di Quarto Casale. La messa domenicale è alle
            11:00; la seconda domenica del mese si sposta alle 12:00 ed è
            presieduta dal parroco.
          </p>
        </div>
      </div>
    </>
  );
}
