"use client";

import { useState, useTransition } from "react";
import { sendPasswordLink, type AdminLinkState } from "@/actions/account-requests-admin";
import CopyLink from "@/components/admin/CopyLink";

/** "Invia link password": nuovo link monouso per scegliere la password (link scaduto o password dimenticata). */
export default function SendPasswordLinkButton({ userId, name }: { userId: number; name: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminLinkState>(undefined);

  return (
    <div className="admin-send-link">
      <button
        type="button"
        className="admin-link admin-btn-link"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Inviare a ${name} un link per scegliere una nuova password?`)) return;
          startTransition(async () => setResult(await sendPasswordLink(userId)));
        }}
      >
        {pending ? "Invio…" : "Invia link password"}
      </button>
      {result?.error && <div className="admin-error">{result.error}</div>}
      {result?.done && <div className="admin-success">{result.done}</div>}
      {result?.link && <CopyLink link={result.link} />}
    </div>
  );
}
