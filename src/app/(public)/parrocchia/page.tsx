import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { sizedImage } from "@/lib/image-url";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/parrocchia.css";

export const metadata: Metadata = { title: "La nostra parrocchia" };

const CDN = "https://res.cloudinary.com/dksk2bjyd/image/upload";

const SEZIONI = [
  {
    href: "/parrocchia/storia",
    name: "Storia della comunità",
    tag: "Dal 1958",
    image: sizedImage(`${CDN}/santalfonso/storia/storia-prima-porta-1900.avif`, 1200),
    alt: "Prima Porta ai primi del '900",
  },
  {
    href: "/parrocchia/gruppi-parrocchiali",
    name: "Gruppi parrocchiali",
    tag: "Carismi",
    image: foto("gruppi/gruppi-intestazione", 1200),
    alt: "Santa Messa all'aperto con i parrocchiani",
  },
  {
    href: "/parrocchia/servizi-parrocchiali",
    name: "Servizi parrocchiali",
    tag: "Donarsi",
    image: foto("servizi/servizi-intestazione", 1200),
    alt: "La chiesa parrocchiale gremita durante una celebrazione",
  },
  {
    href: "/parrocchia/santo-titolare",
    name: "Santo titolare",
    tag: "Sant'Alfonso",
    image: sizedImage(`${CDN}/v1781359764/santalfonso/santalfonso-ritratto.avif`, 1200),
    alt: "Ritratto di Sant'Alfonso Maria de' Liguori",
    position: "50% 20%",
  },
  {
    href: "/parrocchia/visite-pontefici",
    name: "Visite pontefici",
    tag: "Un dono di Dio",
    image: foto("pontefici/pontefici-intestazione", 1200),
    alt: "Papa Francesco con un agnellino sulle spalle tra i figuranti del presepe vivente",
  },
];

/** Indice della sezione "La nostra parrocchia" (dal menù del telefono). */
export default function ParrocchiaPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Sant&apos;Alfonso,{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>la nostra comunità</span>
          </>
        }
        lead="La storia, i gruppi, i servizi, il santo titolare e le visite dei pontefici."
      />

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="par-popes">
            {SEZIONI.map((s, i) => (
              <Link key={s.href} href={s.href} className="par-pope">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.alt}
                  width={1200}
                  height={900}
                  loading={i < 2 ? undefined : "lazy"}
                  style={s.position ? { objectPosition: s.position } : undefined}
                />
                <div className="par-pope__body">
                  <span className="par-pope__date">{s.tag}</span>
                  <h2 className="par-pope__name">{s.name}</h2>
                  <span className="par-pope__more">
                    Scopri
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
