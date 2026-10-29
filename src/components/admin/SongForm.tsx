"use client";

import { useActionState, useDeferredValue, useMemo, useState } from "react";
import type { Song } from "@/db/schema";
import type { SongActionState } from "@/actions/lodate/songs";
import { detectKey, hasChords, italianKeyName, parseChordPro } from "@/lib/lodate/chordpro";
import { MOMENTS, SEASONS } from "@/lib/lodate/constants";
import { slugify } from "@/lib/utils";
import SongSheet from "@/components/lodate/SongSheet";
import "@/app/lodate.css";

const EXAMPLE = `{c: Strofa 1}
[Sol]Tu scendi dalle [Re]stelle, o Re del [Sol]Cielo,
e vieni in una [Re]grotta al freddo e al [Sol]gelo.

{soc}
[Do]Ritornello con [Sol]accordi
{eoc}`;

export default function SongForm({
  action,
  song,
  moments = [],
  seasons = [],
}: {
  action: (prev: SongActionState, formData: FormData) => Promise<SongActionState>;
  song?: Song;
  moments?: string[];
  seasons?: string[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(song?.title ?? "");
  const [slug, setSlug] = useState(song?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!song);
  const [body, setBody] = useState(song?.body ?? "");
  const [musicalKey, setMusicalKey] = useState(song?.musicalKey ?? "");
  const [previewChords, setPreviewChords] = useState(true);
  // Campi controllati: dopo un errore di validazione React reimposta i campi
  // non controllati del form, qui invece restano come li ha lasciati l'utente.
  const [author, setAuthor] = useState(song?.author ?? "");
  const [copyrightNote, setCopyrightNote] = useState(song?.copyrightNote ?? "");
  const [published, setPublished] = useState(song?.published ?? true);
  const [selMoments, setSelMoments] = useState<string[]>(moments);
  const [selSeasons, setSelSeasons] = useState<string[]>(seasons);
  const toggle = (list: string[], value: string, on: boolean) =>
    on ? [...new Set([...list, value])] : list.filter((v) => v !== value);

  const deferredBody = useDeferredValue(body);
  const parsed = useMemo(() => parseChordPro(deferredBody), [deferredBody]);
  const detected = useMemo(() => detectKey(parsed, musicalKey || null), [parsed, musicalKey]);
  const effectiveSlug = slugTouched ? slug : slugify(title);

  return (
    <form action={formAction} className="admin-form lodate-admin-song" style={{ maxWidth: "none" }}>
      <div className="admin-grid-2" style={{ maxWidth: 900 }}>
        <div className="admin-form-row">
          <label htmlFor="title" className="admin-label">Titolo *</label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="slug" className="admin-label">Indirizzo (slug)</label>
          <input
            id="slug"
            name="slug"
            maxLength={120}
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="admin-input mono"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lettere minuscole, numeri e trattini"
          />
          <p className="admin-input-hint">
            /lodate/canti/{effectiveSlug || "…"}
            {slugTouched && !song && (
              <>
                {" · "}
                <button
                  type="button"
                  className="admin-link"
                  style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
                  onClick={() => setSlugTouched(false)}
                >
                  ricava dal titolo
                </button>
              </>
            )}
          </p>
        </div>
        <div className="admin-form-row">
          <label htmlFor="author" className="admin-label">Autore (testo / musica)</label>
          <input
            id="author"
            name="author"
            maxLength={200}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="musicalKey" className="admin-label">Tonalità</label>
          <input
            id="musicalKey"
            name="musicalKey"
            maxLength={20}
            value={musicalKey}
            onChange={(e) => setMusicalKey(e.target.value)}
            placeholder={detected ? `es. ${italianKeyName(detected)}` : "es. Sol, Mim, Fa#m, Sib"}
            className="admin-input"
          />
          <p className="admin-input-hint">
            Facoltativa: serve a scegliere diesis o bemolli nella trasposizione.
            {!musicalKey && detected && ` Se vuota si usa il primo accordo (${italianKeyName(detected)}).`}
          </p>
        </div>
        <div className="admin-form-row">
          <label htmlFor="capo" className="admin-label">Barrè</label>
          <select id="capo" name="capo" defaultValue={song?.capo ?? 0} className="admin-input">
            <option value={0}>Nessuno</option>
            {["I", "II", "III", "IV", "V"].map((label, i) => (
              <option key={label} value={i + 1}>
                {label} tasto
              </option>
            ))}
          </select>
          <p className="admin-input-hint">Il tasto per cui sono scritti gli accordi del testo.</p>
        </div>
      </div>

      <div className="admin-form-row" style={{ maxWidth: 900 }}>
        <label htmlFor="copyrightNote" className="admin-label">Nota sui diritti (copyright)</label>
        <input
          id="copyrightNote"
          name="copyrightNote"
          maxLength={500}
          value={copyrightNote}
          onChange={(e) => setCopyrightNote(e.target.value)}
          placeholder="es. Pubblico dominio — oppure: © Editore, riprodotto con licenza n. …"
          className="admin-input"
        />
        <p className="admin-input-hint">
          Mostrata sotto il canto e in stampa. Carica canti protetti solo se la parrocchia ne ha la licenza.
        </p>
      </div>

      <div className="lodate-admin-grid">
        <div className="admin-form-row">
          <label htmlFor="body" className="admin-label">Testo con accordi (ChordPro) *</label>
          <textarea
            id="body"
            name="body"
            required
            rows={22}
            spellCheck={false}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={EXAMPLE}
            className="admin-input lodate-admin-body"
          />
          <details className="lodate-admin-guide">
            <summary>Guida rapida al formato</summary>
            <ul>
              <li>
                Accordo tra quadre <b>prima</b> della sillaba: <code>[Sol]Tu scendi dalle [Re]stelle</code>
              </li>
              <li>
                Accordi in italiano: Do Re Mi Fa Sol La Si, con <code>#</code> / <code>b</code>, suffissi (
                <code>m</code>, <code>7</code>, <code>maj7</code>, <code>sus4</code>, <code>dim</code>…) e basso con{" "}
                <code>/</code> (<code>[Re/Fa#]</code>). Si accetta anche la notazione anglosassone (C D E…); nel
                sito gli accordi si vedono sempre in italiano.
              </li>
              <li>
                Parte strumentale: una riga di soli accordi, separati se vuoi da <code>|</code>, ad esempio{" "}
                <code>[Re-] | [La-] | [Sib] | [Fa] | [Do]</code>.
              </li>
              <li>Una riga vuota separa le strofe.</li>
              <li>
                Canti alternati: le parti dei soli uomini tra <code>{"{sov_uomo}"}</code> e{" "}
                <code>{"{eov_uomo}"}</code>, quelle delle sole donne tra <code>{"{sov_donna}"}</code> e{" "}
                <code>{"{eov_donna}"}</code>.
              </li>
              <li>
                Ritornello tra <code>{"{soc}"}</code> e <code>{"{eoc}"}</code>.
              </li>
              <li>
                Indicazioni: <code>{"{c: Strofa 2}"}</code>, <code>{"{c: Tutti}"}</code>, <code>{"{c: bis}"}</code>.
              </li>
              <li>
                Canto in più lingue: <code>{"{lang: Italiano}"}</code>, poi <code>{"{lang: Latino}"}</code> e così via
                prima di ogni versione; nel sito si sceglie la lingua da mostrare.
              </li>
              <li>Niente HTML. Le annotazioni degli utenti sono legate alle righe e alle lettere: evita di riordinare le righe dopo la pubblicazione.</li>
            </ul>
            <pre>{EXAMPLE}</pre>
          </details>
        </div>

        <div className="lodate-admin-preview lodate" aria-label="Anteprima">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span className="admin-label" style={{ margin: 0 }}>Anteprima</span>
            {hasChords(parsed) && (
              <label className="admin-checkbox-row" style={{ fontSize: 13 }}>
                <input type="checkbox" checked={previewChords} onChange={(e) => setPreviewChords(e.target.checked)} />
                Accordi
              </label>
            )}
          </div>
          {title && <h3>{title}</h3>}
          {parsed.sections.length === 0 ? (
            <p className="admin-input-hint">Scrivi il testo per vedere l&apos;anteprima.</p>
          ) : (
            <SongSheet song={parsed} showChords={previewChords} />
          )}
          {parsed.warnings.length > 0 && (
            <ul className="lodate-admin-warnings" aria-live="polite">
              {parsed.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <fieldset className="admin-form-row" style={{ border: 0, padding: 0, margin: "0 0 24px" }}>
        <legend className="admin-label">Momenti della Messa</legend>
        <div className="lodate-admin-checks">
          {MOMENTS.map((m) => (
            <label key={m.slug} className="admin-checkbox-row">
              <input
                type="checkbox"
                name="moments"
                value={m.slug}
                checked={selMoments.includes(m.slug)}
                onChange={(e) => setSelMoments((l) => toggle(l, m.slug, e.target.checked))}
              />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="admin-form-row" style={{ border: 0, padding: 0, margin: "0 0 24px" }}>
        <legend className="admin-label">Tempi e occasioni</legend>
        <div className="lodate-admin-checks">
          {SEASONS.map((s) => (
            <label key={s.slug} className="admin-checkbox-row">
              <input
                type="checkbox"
                name="seasons"
                value={s.slug}
                checked={selSeasons.includes(s.slug)}
                onChange={(e) => setSelSeasons((l) => toggle(l, s.slug, e.target.checked))}
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="admin-form-row">
        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            name="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Pubblicato (visibile nell&apos;app Lodate)
        </label>
      </div>

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20, maxWidth: 720 }}>
          {state.error}
        </div>
      )}

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? "Salvataggio…" : "Salva canto"}
      </button>
    </form>
  );
}
