import Link from "next/link";
import { createSong } from "@/actions/lodate/songs";
import SongForm from "@/components/admin/SongForm";
import { requireOwnerPage } from "@/auth";

export default async function NuovoCantoPage() {
  await requireOwnerPage();
  return (
    <>
      <Link href="/admin/canti" className="admin-back">← Canti</Link>
      <div className="admin-page-head">
        <h1>Nuovo canto</h1>
      </div>
      <SongForm action={createSong} />
    </>
  );
}
