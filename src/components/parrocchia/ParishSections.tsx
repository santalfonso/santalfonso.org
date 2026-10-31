/** Sezioni di Gruppi e Servizi parrocchiali: indice in alto, poi foto e testo alternati. */
export type ParishSection = {
  id: string;
  /** Voce breve nell'indice; il titolo completo va in `title`. */
  label: string;
  title: string;
  image: { src: string; alt: string; width: number; height: number };
  body: React.ReactNode;
};

export function ParishIndex({ sections }: { sections: ParishSection[] }) {
  return (
    <nav aria-label="Sezioni della pagina">
      <ul className="par-index">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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
