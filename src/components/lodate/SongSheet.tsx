import { Fragment } from "react";
import { ANNOTATION_MARKS, type AnnotationMark } from "@/lib/lodate/constants";
import { instrumentalTokens, italianChord, splitLine, type LyricLine, type ParsedSong, type Section } from "@/lib/lodate/chordpro";

/** Lettera selezionata per l'annotazione, con la parola che la contiene. */
export type SelectedWord = { line: number; col: number; text: string; word: string };

type AnnotateProps = {
  selected: { line: number; col: number } | null;
  onSelect: (word: SelectedWord) => void;
};

const SECTION_LABEL: Record<Section["kind"], string> = {
  verse: "Strofa",
  chorus: "Ritornello",
  comment: "Indicazione",
  uomo: "Uomini",
  donna: "Donne",
};

function markSymbol(mark: AnnotationMark) {
  return ANNOTATION_MARKS.find((m) => m.mark === mark)?.symbol ?? "";
}
function markLabel(mark: AnnotationMark) {
  return ANNOTATION_MARKS.find((m) => m.mark === mark)?.label ?? "";
}

/** Chiave della mappa delle annotazioni: "riga:colonna". */
export function annotationKey(line: number, col: number) {
  return `${line}:${col}`;
}

/**
 * Resa del canto: accordi sopra la sillaba giusta (allineati anche quando la
 * riga va a capo, perché si va a capo solo tra parole), annotazioni ↑ ↓ —
 * sopra le singole lettere e, in modalità "Annota", lettere selezionabili.
 * Nessun HTML dal testo: solo nodi React.
 */
/**
 * Stampa su due colonne: le strofe (mai spezzate) vengono distribuite pagina per
 * pagina — colonna sinistra, poi destra, poi la pagina dopo — così si legge in
 * ordine anche nei canti lunghi. Il peso di una strofa è il numero di righe (le
 * righe con accordi contano doppio) più lo spazio tra le strofe.
 * Restituisce, per ogni pagina, gli indici delle sezioni di ciascuna colonna;
 * null se il canto ha una sola sezione.
 */
const FIRST_PAGE_UNITS = 34; // sotto titolo e sottotitolo
const PAGE_UNITS = 40;

export function printColumnsLayout(song: ParsedSong, showChords: boolean): number[][][] | null {
  const weights = song.sections.map(
    (sec) =>
      (sec.kind === "uomo" || sec.kind === "donna" ? 2 : 1) +
      sec.lines.reduce(
        (n, l) => n + (l.kind === "lyric" && showChords && l.chords.length > 0 ? (l.chordOnly ? 1 : 2) : 1),
        0
      )
  );
  if (weights.length < 2) return null;
  const total = weights.reduce((a, b) => a + b, 0);

  // Canto che sta in una pagina: due colonne di altezza simile.
  if (total <= FIRST_PAGE_UNITS * 2) return [balance(weights.map((_, i) => i), weights)];

  // Canto lungo: si riempie una colonna alla volta, pagina per pagina.
  const pages: number[][][] = [];
  let page: number[][] = [[]];
  let used = 0;
  let capacity = FIRST_PAGE_UNITS;
  weights.forEach((w, i) => {
    const col = page[page.length - 1];
    if (col.length > 0 && used + w > capacity) {
      if (page.length === 1) {
        page.push([]);
      } else {
        pages.push(page);
        page = [[]];
        capacity = PAGE_UNITS;
      }
      used = 0;
    }
    page[page.length - 1].push(i);
    used += w;
  });
  // ultima pagina con una sola colonna: la si divide a metà
  pages.push(page.length === 1 && page[0].length > 1 ? balance(page[0], weights) : page);
  return pages;
}

/** Divide le sezioni in due colonne di altezza simile (a parità, più lunga la prima). */
function balance(indexes: number[], weights: number[]): number[][] {
  const total = indexes.reduce((n, i) => n + weights[i], 0);
  let best = 1;
  let bestDiff = Infinity;
  let left = 0;
  for (let k = 1; k < indexes.length; k++) {
    left += weights[indexes[k - 1]];
    const diff = Math.abs(left - (total - left)) - (left >= total - left ? 0.5 : 0);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = k;
    }
  }
  return [indexes.slice(0, best), indexes.slice(best)];
}

export default function SongSheet({
  song,
  showChords,
  marks,
  annotate,
  printColumns = false,
}: {
  song: ParsedSong;
  showChords: boolean;
  /** Annotazioni per chiave "riga:colonna". */
  marks?: Map<string, AnnotationMark>;
  annotate?: AnnotateProps | null;
  /** In stampa divide le strofe su due colonne (a schermo non cambia nulla). */
  printColumns?: boolean;
}) {
  const marksByLine = new Set<number>();
  marks?.forEach((_, key) => marksByLine.add(Number(key.split(":")[0])));

  let verseNo = 0;
  const rendered = song.sections.map((section, i) => {
    if (section.kind === "verse") verseNo++;
    return (
      <section
        key={i}
        className={`lodate-sec lodate-sec--${section.kind}`}
        aria-label={section.kind === "verse" ? `${SECTION_LABEL.verse} ${verseNo}` : SECTION_LABEL[section.kind]}
      >
        {(section.kind === "uomo" || section.kind === "donna") && (
          <p className="lodate-voice" aria-hidden="true">
            {SECTION_LABEL[section.kind]}
          </p>
        )}
        {section.lines.map((line) =>
          line.kind === "comment" ? (
            <p key={line.index} className="lodate-comment">
              {line.text}
            </p>
          ) : (
            <SheetLine
              key={line.index}
              line={line}
              showChords={showChords}
              marks={marks}
              lineHasMarks={marksByLine.has(line.index)}
              annotate={annotate}
            />
          )
        )}
      </section>
    );
  });

  const layout = printColumns ? printColumnsLayout(song, showChords) : null;
  const className = `lodate-sheet${annotate ? " is-annotating" : ""}`;
  if (layout === null) return <div className={className}>{rendered}</div>;
  return (
    <div className={`${className} lodate-sheet--cols`}>
      {layout.map((cols, p) => (
        <div key={p} className="lodate-sheet__page">
          {cols.map((indexes, c) => (
            <div key={c} className="lodate-sheet__col">
              {indexes.map((i) => rendered[i])}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SheetLine({
  line,
  showChords,
  marks,
  lineHasMarks,
  annotate,
}: {
  line: LyricLine;
  showChords: boolean;
  marks?: Map<string, AnnotationMark>;
  lineHasMarks: boolean;
  annotate?: AnnotateProps | null;
}) {
  if (line.chordOnly && !showChords) return null;
  // Parte strumentale: accordi in fila su una riga, con i separatori `|`.
  if (line.chordOnly) {
    return (
      <div className="lodate-line lodate-line--chords">
        {instrumentalTokens(line).map((t, i) =>
          "bar" in t ? (
            <span key={i} className="lodate-bar" aria-hidden="true">|</span>
          ) : (
            <span key={i} className="lodate-ch">{italianChord(t.chord)}</span>
          )
        )}
      </div>
    );
  }
  const chordRow = showChords && line.chords.length > 0;

  // Riga semplice: testo continuo (migliore per lettori di schermo e a capo naturale).
  if (!chordRow && !lineHasMarks && !annotate) {
    return <div className="lodate-line">{line.text || " "}</div>;
  }

  const words = splitLine(line);
  const lettersMode = lineHasMarks || !!annotate;
  return (
    <div className={`lodate-line lodate-line--grid${chordRow ? " has-chords" : ""}${line.chordOnly ? " is-chord-only" : ""}`}>
      {words.map((word, w) => {
        const wordText = word.parts.map((p) => p.text).join("").trim();
        const parts = word.parts.map((part, p) => (
          <span className={`lodate-p${p < word.parts.length - 1 && part.text ? " lodate-p--mid" : ""}`} key={p}>
            {chordRow && (
              <span className="lodate-ch" aria-hidden="true">
                {part.chord ? italianChord(part.chord) : "\u200b"}
              </span>
            )}
            {lettersMode && part.text ? (
              <span className="lodate-tx lodate-tx--letters">
                <Letters
                  text={part.text}
                  line={line.index}
                  startCol={part.col}
                  word={wordText}
                  marks={marks}
                  annotate={word.annotatable ? annotate : null}
                />
              </span>
            ) : (
              <span className="lodate-tx">{part.text || "\u200b"}</span>
            )}
          </span>
        ));
        return (
          <Fragment key={w}>
            {w > 0 && "\u200b"}
            <span className="lodate-w">{parts}</span>
          </Fragment>
        );
      })}
    </div>
  );
}

const IS_LETTER = /[\p{L}\p{N}]/u;

/** Le lettere di un pezzo di testo, ciascuna con lo spazio per il segno sopra. */
function Letters({
  text,
  line,
  startCol,
  word,
  marks,
  annotate,
}: {
  text: string;
  line: number;
  startCol: number;
  word: string;
  marks?: Map<string, AnnotationMark>;
  annotate?: AnnotateProps | null;
}) {
  const cells = [];
  let col = startCol;
  for (const ch of text) {
    const at = col;
    col += ch.length;
    const mark = marks?.get(annotationKey(line, at));
    // Due segni su lettere vicine: le lettere si allargano un poco per non sovrapporli.
    const crowded =
      !!mark && (marks!.has(annotationKey(line, at - 1)) || marks!.has(annotationKey(line, at + ch.length)));
    const wide = crowded ? " lodate-c--wide" : "";
    const mk = (
      <span className={`lodate-mk${mark ? ` lodate-mk--${mark}` : ""}`} title={mark ? markLabel(mark) : undefined}>
        {mark ? (
          <>
            <span aria-hidden="true">{markSymbol(mark)}</span>
            <span className="lodate-sr">{markLabel(mark)}: </span>
          </>
        ) : (
          "\u200b"
        )}
      </span>
    );
    if (annotate && IS_LETTER.test(ch)) {
      const selected = annotate.selected?.line === line && annotate.selected.col === at;
      cells.push(
        <button
          key={at}
          type="button"
          className={`lodate-c lodate-c--btn${wide}${selected ? " is-selected" : ""}`}
          data-annot={annotationKey(line, at)}
          aria-pressed={selected}
          aria-label={`Annota la lettera “${ch}” di “${word}”${mark ? ` (${markLabel(mark)})` : ""}`}
          onClick={() => annotate.onSelect({ line, col: at, text: ch, word })}
        >
          {mk}
          <span className="lodate-c__ch">{ch}</span>
        </button>
      );
    } else {
      cells.push(
        <span key={at} className={`lodate-c${wide}`}>
          {mk}
          <span className="lodate-c__ch">{ch}</span>
        </span>
      );
    }
  }
  return <>{cells}</>;
}
