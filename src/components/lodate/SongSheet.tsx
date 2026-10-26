import { Fragment } from "react";
import { ANNOTATION_MARKS, type AnnotationMark } from "@/lib/lodate/constants";
import { splitLine, type LyricLine, type ParsedSong, type Section } from "@/lib/lodate/chordpro";

export type SelectedWord = { line: number; col: number; text: string };

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
 * sopra le parole e, in modalità "Annota", parole selezionabili.
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
  return (
    <div className={`lodate-line lodate-line--grid${chordRow ? " has-chords" : ""}${line.chordOnly ? " is-chord-only" : ""}`}>
      {words.map((word, w) => {
        const mark = marks?.get(annotationKey(line.index, word.col));
        const wordText = word.parts.map((p) => p.text).join("");
        const parts = word.parts.map((part, p) => (
          <span className={`lodate-p${p < word.parts.length - 1 && part.text ? " lodate-p--mid" : ""}`} key={p}>
            {lineHasMarks && (
              <span
                className={`lodate-mk${p === 0 && mark ? ` lodate-mk--${mark}` : ""}`}
                aria-hidden={p === 0 && mark ? undefined : true}
                title={p === 0 && mark ? markLabel(mark) : undefined}
              >
                {p === 0 && mark ? (
                  <>
                    <span aria-hidden="true">{markSymbol(mark)}</span>
                    <span className="lodate-sr">{markLabel(mark)}: </span>
                  </>
                ) : (
                  "​"
                )}
              </span>
            )}
            {chordRow && (
              <span className="lodate-ch" aria-hidden="true">
                {part.chord ?? "​"}
              </span>
            )}
            <span className="lodate-tx">{part.text || "​"}</span>
          </span>
        ));
        const selected =
          annotate?.selected && annotate.selected.line === line.index && annotate.selected.col === word.col;
        return (
          <Fragment key={w}>
            {w > 0 && "​"}
            {annotate && word.annotatable ? (
              <button
                type="button"
                className={`lodate-w lodate-w--btn${selected ? " is-selected" : ""}`}
                data-annot={annotationKey(line.index, word.col)}
                aria-pressed={!!selected}
                aria-label={`Annota “${wordText.trim()}”${mark ? ` (${markLabel(mark)})` : ""}`}
                onClick={() => annotate.onSelect({ line: line.index, col: word.col, text: wordText.trim() })}
              >
                {parts}
              </button>
            ) : (
              <span className="lodate-w">{parts}</span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
