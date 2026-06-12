import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Contatti" };

export default function ContattiPage() {
  return (
    <>
      <PageTitle title="Contatti" subtitle="Come raggiungerci e contattarci" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-amber-900">
              Recapiti
            </h2>
            <p className="leading-relaxed text-stone-700">
              <strong>Indirizzo</strong>
              <br />
              Via della Giustiniana, 227
              <br />
              00188 Roma (RM)
            </p>
            <p className="mt-4 leading-relaxed text-stone-700">
              <strong>Telefono</strong>
              <br />
              <a href="tel:+39063320803" className="text-amber-700 hover:underline">
                +39 06 3320803
              </a>
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-amber-900">
              Ufficio parrocchiale
            </h2>
            <p className="leading-relaxed text-stone-700">
              <strong>Giorni feriali:</strong> 17:00 – 18:30
              <br />
              <strong>Sabato mattina:</strong> momentaneamente chiuso
            </p>
            <p className="mt-4 text-sm text-stone-500">
              L&apos;ufficio parrocchiale è a disposizione per prenotazioni di
              sacramenti, richieste di certificati e ogni altra necessità.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-2 text-xl font-bold text-amber-900">
            Orari delle Sante Messe
          </h2>
          <p className="leading-relaxed text-stone-700">
            <strong>Feriali (lunedì – sabato):</strong> 8:00 e 18:30
            <br />
            <strong>Domenica e festivi:</strong> 8:30 · 10:30 · 12:00 · 18:30
          </p>
        </div>
      </div>
    </>
  );
}
