"use client";

import { useState } from "react";

/** Link da inviare a mano (quando l'email non è partita), con il pulsante Copia. */
export default function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="admin-copy-link">
      <input className="admin-input" value={link} readOnly onFocus={(e) => e.currentTarget.select()} aria-label="Link per scegliere la password" />
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={() => {
          navigator.clipboard?.writeText(link).then(() => setCopied(true), () => setCopied(false));
        }}
      >
        {copied ? "Copiato" : "Copia"}
      </button>
    </div>
  );
}
