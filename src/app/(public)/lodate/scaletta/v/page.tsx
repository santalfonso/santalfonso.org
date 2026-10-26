import type { Metadata } from "next";
import Link from "next/link";
import SetlistShare from "@/components/lodate/SetlistShare";
import SetlistView from "@/components/lodate/SetlistView";
import { decodeSetlist, encodeSetlist, setlistUrlPath } from "@/lib/lodate/setlist";
import { resolveSetlist } from "@/lib/lodate/setlist-db";
import "@/app/lodate-scalette.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scaletta",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ScalettaUrlPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).d;
  const decoded = decodeSetlist(Array.isArray(raw) ? raw[0] : raw);

  if (!decoded) {
    return (
      <div className="ls ls-stack">
        <h2 className="ls-title">Scaletta non valida</h2>
        <p className="ls-muted">Il link è incompleto, troppo lungo o non più valido.</p>
        <p>
          <Link className="ls-btn ls-btn--primary" href="/lodate/scaletta">
            Prepara una nuova scaletta
          </Link>
        </p>
      </div>
    );
  }

  const { data, songs } = await resolveSetlist(decoded);
  // percorso canonico (ricodificato dopo la validazione)
  const selfPath = setlistUrlPath(data);

  return (
    <div className="ls ls-stack">
      <SetlistView data={data} songs={songs} selfPath={selfPath} />
      <div className="ls-row ls-noprint">
        <Link className="ls-btn" href={`/lodate/scaletta?d=${encodeSetlist(data)}`}>
          Modifica o salva
        </Link>
        <Link className="ls-btn" href={`/lodate/scaletta?d=${encodeSetlist({ ...data, date: null })}`}>
          Usa come modello
        </Link>
      </div>
      <SetlistShare path={selfPath} title={data.title || "Scaletta"} />
    </div>
  );
}
