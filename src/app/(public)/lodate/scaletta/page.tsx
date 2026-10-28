import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import SetlistBuilder from "@/components/lodate/SetlistBuilder";
import { seasonForDate } from "@/lib/lodate/liturgia";
import {
  decodeSetlist,
  emptySetlist,
  filterKnownSongs,
  type SetlistData,
} from "@/lib/lodate/setlist";
import { loadSavedSetlist, loadSongCatalog } from "@/lib/lodate/setlist-db";
import "@/app/lodate-scalette.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prepara la scaletta",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function ScalettaBuilderPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const editId = first(sp.id);
  const encoded = first(sp.d);

  let initial: SetlistData = emptySetlist();
  let editPublicId: string | null = null;
  let invalidLink = false;

  if (editId) {
    if (!userId) {
      redirect(`/accedi?next=${encodeURIComponent(`/lodate/scaletta?id=${editId}`)}`);
    }
    const saved = await loadSavedSetlist(editId);
    if (!saved || saved.ownerId !== userId) notFound();
    initial = saved.data;
    editPublicId = saved.publicId;
  } else if (encoded) {
    const decoded = decodeSetlist(encoded);
    if (decoded) initial = decoded;
    else invalidLink = true;
  }

  const catalog = await loadSongCatalog();
  initial = filterKnownSongs(initial, new Set(catalog.map((s) => s.id)));
  const initialSeason = initial.date ? seasonForDate(initial.date) : null;

  return (
    <div className="ls">
      <div className="ls-stack">
        <header>
          <span className="ls-kicker">Scaletta</span>
          <h2 className="ls-title">{editPublicId ? "Modifica la scaletta" : "Prepara la scaletta"}</h2>
        </header>
        {invalidLink && (
          <p className="ls-error" role="alert">
            Il link della scaletta non è valido: puoi ricominciare da qui.
          </p>
        )}
        {catalog.length === 0 && <p className="ls-note">Non ci sono ancora canti pubblicati.</p>}
        <SetlistBuilder
          key={editPublicId ?? encoded ?? "new"}
          catalog={catalog}
          initial={initial}
          editPublicId={editPublicId}
          isLoggedIn={Boolean(userId)}
          initialSeason={initialSeason}
        />
      </div>
    </div>
  );
}
