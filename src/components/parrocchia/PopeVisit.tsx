import Link from "next/link";
import PageTitle from "@/components/PageTitle";

type Photo = { src: string; alt: string; width: number; height: number };

/** Un blocco del racconto: foto accanto al testo, poi una foto a tutta larghezza. */
export type VisitBlock = { photo: Photo; text: React.ReactNode; band?: Photo };

/** Pagina della visita di un Papa: intestazione, racconto con foto, video integrale. */
export default function PopeVisit({
  name,
  date,
  hero,
  intro,
  blocks,
  video,
}: {
  name: React.ReactNode;
  date: string;
  hero: Photo;
  intro: React.ReactNode;
  blocks: VisitBlock[];
  video: { id: string; title: string };
}) {
  return (
    <>
      <PageTitle kicker="Visite dei pontefici" title={name} lead={date} />

      <section style={{ padding: 0 }}>
        <div className="container">
          <figure className="par-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.src} alt={hero.alt} width={hero.width} height={hero.height} />
          </figure>
        </div>
      </section>

      <section style={{ paddingBottom: 0 }}>
        <div className="container-narrow prose-parish">{intro}</div>
      </section>

      {blocks.map((b, i) => (
        <section key={b.photo.src} style={{ paddingBottom: 0 }}>
          <div className="container">
            <div
              className={`par-section${i % 2 ? " par-section--flip" : ""}`}
              style={{ marginBottom: b.band ? "clamp(48px, 7vw, 96px)" : 0 }}
            >
              <figure className="par-section__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.photo.src} alt={b.photo.alt} width={b.photo.width} height={b.photo.height} loading="lazy" />
              </figure>
              <div className="prose-parish">{b.text}</div>
            </div>
            {b.band && (
              <figure className="par-band">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.band.src} alt={b.band.alt} width={b.band.width} height={b.band.height} loading="lazy" />
              </figure>
            )}
          </div>
        </section>
      ))}

      <section>
        <div className="container-narrow">
          <h2 style={{ marginBottom: 20, fontSize: "clamp(22px, 2.4vw, 28px)" }}>Il video integrale della visita</h2>
          <div className="par-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <p style={{ marginTop: 32 }}>
            <Link href="/parrocchia/visite-pontefici" className="par-back">
              <span aria-hidden="true">←</span> Tutte le visite dei pontefici
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
