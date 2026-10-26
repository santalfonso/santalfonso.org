"use client";

import { useState, useSyncExternalStore } from "react";
import QrCode from "./QrCode";

const noopSubscribe = () => () => {};

function useOrigin() {
  return useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
}

function useCanShare() {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  );
}

type Props = {
  /** Percorso relativo della scaletta, es. /lodate/s/abc… */
  path: string;
  title: string;
};

/** Copia link, condivisione nativa e QR code della scaletta. */
export default function SetlistShare({ path, title }: Props) {
  const origin = useOrigin();
  const canShare = useCanShare();
  const [status, setStatus] = useState("");
  const url = origin ? origin + path : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copiato.");
    } catch {
      window.prompt("Copia il link:", url);
    }
  }

  async function share() {
    try {
      await navigator.share({ title, text: title, url });
    } catch {
      /* annullato dall'utente */
    }
  }

  return (
    <section className="ls-card ls-stack" aria-labelledby="ls-share-title">
      <h2 id="ls-share-title" className="ls-noprint">Condividi</h2>
      <div className="ls-row ls-noprint">
        <button type="button" className="ls-btn ls-btn--primary" onClick={copy} disabled={!url}>
          Copia link
        </button>
        {canShare && (
          <button type="button" className="ls-btn" onClick={share} disabled={!url}>
            Condividi…
          </button>
        )}
      </div>
      <p className="ls-status ls-noprint" role="status" aria-live="polite">{status}</p>
      {url && <QrCode value={url} fileName={`scaletta-${slugish(title)}`} alt={`Codice QR della scaletta «${title}»`} />}
    </section>
  );
}

function slugish(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "qr"
  );
}
