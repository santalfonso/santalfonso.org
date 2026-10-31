/** Sezioni di Gruppi e Servizi parrocchiali: foto e testo alternati. */
export type ParishSection = {
  id: string;
  title: string;
  image: { src: string; alt: string; width: number; height: number };
  body: React.ReactNode;
};

export default function ParishSections({ sections }: { sections: ParishSection[] }) {
  return (
    <div className="par-sections">
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="par-section" aria-labelledby={`${s.id}-titolo`} style={{ padding: 0 }}>
          <figure className="par-section__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image.src} alt={s.image.alt} width={s.image.width} height={s.image.height} loading="lazy" />
          </figure>
          <div className="prose-parish">
            <h2 id={`${s.id}-titolo`}>{s.title}</h2>
            {s.body}
          </div>
        </section>
      ))}
    </div>
  );
}
