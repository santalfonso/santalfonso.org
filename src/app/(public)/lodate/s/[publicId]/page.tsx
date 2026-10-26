import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import SetlistDeleteButton from "@/components/lodate/SetlistDeleteButton";
import SetlistShare from "@/components/lodate/SetlistShare";
import SetlistView from "@/components/lodate/SetlistView";
import { encodeSetlist } from "@/lib/lodate/setlist";
import { loadSavedSetlist, resolveSetlist } from "@/lib/lodate/setlist-db";
import "@/app/lodate-scalette.css";

export const dynamic = "force-dynamic";

type Params = Promise<{ publicId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const saved = await loadSavedSetlist((await params).publicId);
  return {
    title: saved?.data.title || "Scaletta",
    robots: { index: false, follow: false },
  };
}

export default async function SavedSetlistPage({ params }: { params: Params }) {
  const { publicId } = await params;
  const saved = await loadSavedSetlist(publicId);
  if (!saved) notFound();

  const session = await auth();
  const isOwner = Boolean(session?.user?.id) && Number(session?.user?.id) === saved.ownerId;
  const { data, songs } = await resolveSetlist(saved.data);
  const selfPath = `/lodate/s/${saved.publicId}`;
  const template = `/lodate/scaletta?d=${encodeSetlist({ ...data, date: null })}`;

  return (
    <div className="ls ls-stack">
      {isOwner && (
        <p className="ls-small ls-noprint">
          <Link className="ls-link" href="/lodate/area">
            ← Le mie scalette
          </Link>
        </p>
      )}
      <SetlistView data={data} songs={songs} selfPath={selfPath} />
      <div className="ls-row ls-noprint">
        {isOwner && (
          <Link className="ls-btn ls-btn--primary" href={`/lodate/scaletta?id=${saved.publicId}`}>
            Modifica
          </Link>
        )}
        <Link className="ls-btn" href={template}>
          Duplica
        </Link>
        {isOwner && <SetlistDeleteButton publicId={saved.publicId} title={data.title} />}
      </div>
      <SetlistShare path={selfPath} title={data.title || "Scaletta"} />
    </div>
  );
}
