"use client";

import { useFormStatus } from "react-dom";
import { deleteSetlist } from "@/actions/lodate/setlists";

function Submit({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ls-btn ls-btn--danger" disabled={pending}>
      {pending ? "Eliminazione…" : "Elimina"}
      <span className="ls-sr"> la scaletta «{title}»</span>
    </button>
  );
}

/** Elimina una propria scaletta, dopo conferma. */
export default function SetlistDeleteButton({ publicId, title }: { publicId: string; title: string }) {
  return (
    <form
      action={deleteSetlist}
      onSubmit={(e) => {
        if (!window.confirm(`Eliminare definitivamente la scaletta «${title}»?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="publicId" value={publicId} />
      <Submit title={title} />
    </form>
  );
}
