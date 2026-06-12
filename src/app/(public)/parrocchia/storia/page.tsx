import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Storia della comunità" };

export default function StoriaPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Una comunità in{" "}
            <span style={{ color: "var(--azure-deep)" }}>cammino</span> dal
            1958.
          </>
        }
        lead="Dalle prime famiglie arrivate a Prima Porta alla parrocchia di oggi: la storia della nostra comunità."
      />
      <section style={{ padding: 0 }}>
        <div className="container">
          <div className="ph ph--wide">
            <span className="ph__label">foto: la comunità riunita</span>
          </div>
        </div>
      </section>
      <article className="prose-parish container-narrow" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <h2>Le nostre origini</h2>
        <p>
          Verso la fine degli anni &apos;50, Prima Porta vide l&apos;arrivo di
          numerose famiglie provenienti principalmente dall&apos;Italia centrale
          e meridionale. Queste persone cercavano di costruire una nuova vita in
          città, portando con sé tradizioni religiose radicate. Per rispondere
          alle loro esigenze spirituali, il Vicariato Romano mise a disposizione
          una villetta in via della Giustiniana 202 ad aprile 1958, affidata
          alle suore Francescane di Susa. L&apos;edificio conteneva una piccola
          sala al piano terra destinata a cappella, che negli anni &apos;60
          divenne il primo nucleo della comunità parrocchiale.
        </p>

        <h2>L&apos;arrivo di don Eulogio</h2>
        <p>
          Nel settembre 1965, a dieci giorni dall&apos;alluvione che colpì Prima
          Porta, arrivò dalla Spagna don Eulogio Carballido Diaz. I primi tre
          mesi furono difficili, tanto che considerò il ritorno in patria, ma il
          suo forte senso del dovere e la sua tenacia lo trattennero. Per dieci
          anni fu vicario presso i Santi Urbano e Lorenzo, dedicandosi ai poveri
          e alle famiglie della zona.
        </p>

        <h2>L&apos;istituzione della parrocchia</h2>
        <p>
          Il 1° ottobre 1975, il Cardinale Poletti istituì ufficialmente la
          nuova parrocchia dedicata a Sant&apos;Alfonso Maria de&apos; Liguori
          in via della Giustiniana 249, con don Eulogio come economo-parroco. La
          sua nomina effettiva a parroco avvenne il 25 settembre 1978, approvata
          da Papa Paolo VI, e prese ufficialmente possesso il 27 settembre 1978.
        </p>
        <p>
          Nel periodo tra gli anni &apos;60 e &apos;70, l&apos;incremento
          demografico rese necessaria l&apos;apertura di ulteriori sedi.
          Arrivarono inoltre le suore Carmelitane della Carità (1972) e le
          Piccole Figlie dei Sacri Cuori (1980), attive nell&apos;educazione e
          nell&apos;evangelizzazione.
        </p>
      </article>
    </>
  );
}
