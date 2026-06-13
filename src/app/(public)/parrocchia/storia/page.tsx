import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Storia della comunità" };

const CDN = "https://res.cloudinary.com/dksk2bjyd/image/upload";

const foto = {
  primaporta1900: `${CDN}/santalfonso/storia/storia-prima-porta-1900.avif`,
  costruzioneInterno: `${CDN}/santalfonso/storia/storia-costruzione-interno.avif`,
  primaPietra: `${CDN}/santalfonso/storia/storia-prima-pietra.avif`,
  donEulogioGpii: `${CDN}/santalfonso/storia/storia-doneulogio-gpii.avif`,
  costruzioneEsterno: `${CDN}/santalfonso/storia/storia-costruzione-esterno.avif`,
};

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

      {/* Foto storica Prima Porta */}
      <section style={{ padding: 0 }}>
        <div className="container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.primaporta1900}
            alt="Prima Porta ai primi del '900"
            style={{
              width: "100%",
              display: "block",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--rule)",
            }}
          />
          <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8, textAlign: "center" }}>
            Prima Porta ai primi del &apos;900
          </p>
        </div>
      </section>

      <article className="prose-parish container-narrow" style={{ paddingTop: 64, paddingBottom: 0 }}>
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
      </article>

      {/* Foto interno cantiere */}
      <section style={{ paddingTop: 32, paddingBottom: 0 }}>
        <div className="container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.costruzioneInterno}
            alt="Interno della chiesa in costruzione"
            style={{
              width: "100%",
              aspectRatio: "16/9",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--rule)",
              display: "block",
            }}
          />
          <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8, textAlign: "center" }}>
            La nuova chiesa in costruzione
          </p>
        </div>
      </section>

      <article className="prose-parish container-narrow" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <h2>L&apos;arrivo di don Eulogio</h2>
        <p>
          Nel settembre 1965, a dieci giorni dall&apos;alluvione che colpì Prima
          Porta, arrivò dalla Spagna don Eulogio Carballido Diaz. I primi tre
          mesi furono difficili, tanto che considerò il ritorno in patria, ma il
          suo forte senso del dovere e la sua tenacia lo trattennero. Per dieci
          anni fu vicario presso i Santi Urbano e Lorenzo, dedicandosi ai poveri
          e alle famiglie della zona.
        </p>
      </article>

      {/* Foto Don Eulogio con Giovanni Paolo II */}
      <section style={{ paddingTop: 32, paddingBottom: 0 }}>
        <div className="container-narrow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.donEulogioGpii}
            alt="Don Eulogio con Papa Giovanni Paolo II"
            style={{
              width: "100%",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--rule)",
              display: "block",
            }}
          />
          <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8, textAlign: "center" }}>
            Don Eulogio Carballido Diaz con Papa Giovanni Paolo II
          </p>
        </div>
      </section>

      <article className="prose-parish container-narrow" style={{ paddingTop: 48, paddingBottom: 0 }}>
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

      {/* Foto cantiere: prima pietra + esterno */}
      <section style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.primaPietra}
                alt="Cerimonia della prima pietra"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--rule)",
                }}
              />
              <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8, textAlign: "center" }}>
                La cerimonia della prima pietra
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.costruzioneEsterno}
                alt="La chiesa in costruzione, vista esterna"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--rule)",
                }}
              />
              <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8, textAlign: "center" }}>
                L&apos;interno della chiesa durante i lavori
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
