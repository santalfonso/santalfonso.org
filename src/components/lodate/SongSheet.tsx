import { Fragment } from "react";
import { ANNOTATION_MARKS, type AnnotationMark } from "@/lib/lodate/constants";
import { italianChord, splitLine, type LyricLine, type ParsedSong, type Section } from "@/lib/lodate/chordpro";

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
export default function SongSheet({
  song,
  showChords,
  marks,
  annotate,
}: {
  song: ParsedSong;
  showChords: boolean;
  /** Annotazioni per chiave "riga:colonna". */
  marks?: Map<string, AnnotationMark>;
  annotate?: AnnotateProps | null;
}) {
  const marksByLine = new Set<number>();
  marks?.forEach((_, key) => marksByLine.add(Number(key.split(":")[0])));

  let verseNo = 0;
  return (
    <div className={`lodate-sheet${annotate ? " is-annotating" : ""}`}>
      {song.sections.map((section, i) => {
        if (section.kind === "verse") verseNo++;
        return (
          <section
            key={i}
            className={`lodate-sec lodate-sec--${section.kind}`}
            aria-label={section.kind === "verse" ? `${SECTION_LABEL.verse} ${verseNo}` : SECTION_LABEL[section.kind]}
          >
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
      })}
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
          className={`lodate-c lodate-c--btn${selected ? " is-selected" : ""}`}
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
        <span key={at} className="lodate-c">
          {mk}
          <span className="lodate-c__ch">{ch}</span>
        </span>
      );
    }
  }
  return <>{cells}</>;
}
