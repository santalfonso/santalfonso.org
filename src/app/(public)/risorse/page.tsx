import type { Metadata } from "next";
import BookGrid from "@/components/BookGrid";
import { sizedImage } from "@/lib/image-url";
import { LIBRI } from "@/lib/libri";
import { getCategoriesWithFiles } from "@/lib/resources-data";
import { formatFileSize } from "@/lib/utils";
import type { Resource } from "@/db/schema";
import "@/app/risorse.css";

export const metadata: Metadata = {
  title: "Risorse",
  description: "Libretti dei festeggiamenti della Madonna del Rosario, documenti della parrocchia e libri consigliati.",
};
export const dynamic = "force-dynamic";

function fileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toUpperCase();
  return ext && ext !== fileName.toUpperCase() && ext.length <= 4 ? ext : "File";
}

function FileList({ files }: { files: Resource[] }) {
  return (
    <ul className="ris-files">
      {files.map((f) => (
        <li key={f.id}>
          <a href={`/risorse/${f.id}/file`} target="_blank" rel="noopener noreferrer" className="ris-file">
            <span className="ris-file__type">{fileType(f.fileName)}</span>
            <span className="ris-file__text">
              <span className="ris-file__title">{f.title}</span>
              {(f.description || f.fileSize) && (
                <span className="ris-file__meta">
                  {[f.description, formatFileSize(f.fileSize)].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
            <span className="ris-file__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
              </svg>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function RisorsePage() {
  const { categories, uncategorized } = await getCategoriesWithFiles();
  const visible = categories.filter((c) => c.files.length > 0);

  return (
    <>
      <section style={{ paddingTop: 64, paddingBottom: 48 }}>
        <div className="container-narrow">
          <span className="kicker">Risorse</span>
          <h1 style={{ marginTop: 20 }}>
            Libretti, documenti e materiali per il{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>cammino</span>.
          </h1>
          <p className="lead" style={{ marginTop: 20 }}>
            Materiali utili e testi consigliati: l&apos;archivio dei libretti dei festeggiamenti della Madonna del
            Rosario, i documenti della parrocchia da scaricare e le letture proposte durante le catechesi.
          </p>
        </div>
      </section>

      {(visible.length > 0 || uncategorized.length > 0) && (
        <section style={{ paddingTop: 0 }}>
          <div className="container ris-cats">
            {visible.map((c) => (
              <article key={c.id} id={`categoria-${c.id}`} className="ris-cat" aria-labelledby={`categoria-${c.id}-titolo`}>
                {c.imageUrl && (
                  <figure className="ris-cat__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sizedImage(c.imageUrl, 1000)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: c.imageFocus ?? undefined }}
                    />
                  </figure>
                )}
                <div className="ris-cat__body">
                  <span className="kicker">
                    {c.files.length} file da scaricare
                  </span>
                  <h2 id={`categoria-${c.id}-titolo`} className="ris-cat__title">{c.name}</h2>
                  {c.description && <p className="ris-cat__desc">{c.description}</p>}
                  <FileList files={c.files} />
                </div>
              </article>
            ))}

            {uncategorized.length > 0 && (
              <article className="ris-cat ris-cat--plain" aria-labelledby="altri-documenti">
                <div className="ris-cat__body">
                  <h2 id="altri-documenti" className="ris-cat__title">Altri documenti</h2>
                  <FileList files={uncategorized} />
                </div>
              </article>
            )}
          </div>
        </section>
      )}

      {/* Libri consigliati: stessa grafica della pagina del Santo titolare */}
      <section id="libri" style={{ background: "var(--bg-soft)", paddingTop: 64, paddingBottom: 64 }}>
        <div className="container">
          <div style={{ marginBottom: 40 }}>
            <span className="kicker">Letture proposte durante le catechesi</span>
            <h2 style={{ marginTop: 14 }}>Libri consigliati</h2>
          </div>
          <BookGrid libri={LIBRI} showAuthor />
        </div>
      </section>
    </>
  );
}
