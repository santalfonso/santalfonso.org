import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/parrocchia.css";

export const metadata: Metadata = { title: "Visite pontefici" };

const VISITE = [
  {
    href: "/parrocchia/visite-pontefici/san-giovanni-paolo-ii",
    name: "San Giovanni Paolo II",
    date: "4 Febbraio 2001",
    image: { src: foto("pontefici/gpii-intestazione", 1200), alt: "San Giovanni Paolo II benedice i bambini della parrocchia" },
  },
  {
    href: "/parrocchia/visite-pontefici/papa-francesco",
    name: "Papa Francesco",
    date: "6 Gennaio 2014",
    image: { src: foto("pontefici/francesco-intestazione", 1200), alt: "Papa Francesco saluta i fedeli nel presepe vivente della parrocchia" },
  },
];

export default function VisitePonteficiPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Visite dei{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>pontefici</span>
          </>
        }
        lead="Un dono di Dio alla nostra comunità."
      />

      <section style={{ padding: 0 }}>
        <div className="container">
          <figure className="par-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto("pontefici/pontefici-intestazione", 2000)} alt="Papa Francesco con un agnellino sulle spalle tra i figuranti del presepe vivente" width={2000} height={1324} />
          </figure>
        </div>
      </section>

      <section style={{ paddingBottom: 48 }}>
        <div className="container-narrow">
          <p style={{ fontSize: 17, lineHeight: 1.7 }}>
            La nostra parrocchia ha avuto il grande dono da parte di Dio di ricevere la visita di due pontefici. San
            Giovanni Paolo II venne in visita pastorale all&apos;inizio del nuovo millennio, un periodo storico molto
            importante per la parrocchia poiché ricco di momenti significativi. Papa Francesco venne in &quot;visita
            privata&quot; (per quanto la si possa chiamare così) nell&apos;Epifania del 2014 per poter visitare il nostro
            presepe vivente.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="par-popes">
            {VISITE.map((v) => (
              <Link key={v.href} href={v.href} className="par-pope">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.image.src} alt={v.image.alt} width={1200} height={900} loading="lazy" />
                <div className="par-pope__body">
                  <span className="par-pope__date">{v.date}</span>
                  <h2 className="par-pope__name">{v.name}</h2>
                  <span className="par-pope__more">
                    Leggi tutto
                    <span className="par-pope__arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
