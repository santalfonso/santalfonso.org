import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Visite pontefici" };

export default function VisitePonteficiPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Le visite dei{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>pontefici</span>
          </>
        }
        lead="Un dono di Dio alla nostra comunità: due papi hanno varcato la soglia della nostra parrocchia."
      />
      <article className="prose-parish container-narrow" style={{ paddingBottom: 64 }}>
        <p>
          La parrocchia Sant&apos;Alfonso Maria de&apos; Liguori ha ricevuto il
          privilegio di accogliere due pontefici.
        </p>
        <h2>San Giovanni Paolo II — 4 febbraio 2001</h2>
        <p>
          San Giovanni Paolo II effettuò una visita pastorale il 4 febbraio
          2001, in un momento storico significativo caratterizzato da numerosi
          eventi importanti per la comunità.
        </p>
        <h2>Papa Francesco — 6 gennaio 2014</h2>
        <p>
          Papa Francesco si recò in «visita privata» il 6 gennaio 2014 per
          ammirare il presepe vivente allestito dalla parrocchia in occasione
          dell&apos;Epifania.
        </p>
      </article>
    </>
  );
}
