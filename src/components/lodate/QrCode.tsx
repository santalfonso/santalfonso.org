"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type Props = {
  /** URL assoluto da codificare. */
  value: string;
  /** Nome del file scaricato (senza estensione). */
  fileName?: string;
  /** Testo alternativo dell'immagine. */
  alt?: string;
};

/** QR code generato nel browser (nessun servizio esterno), scaricabile come PNG. */
export default function QrCode({ value, fileName = "scaletta-qr", alt = "Codice QR del link" }: Props) {
  const [svg, setSvg] = useState<{ value: string; src: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) return;
    let cancelled = false;
    QRCode.toString(value, { type: "svg", errorCorrectionLevel: "M", margin: 1 })
      .then((s) => {
        if (!cancelled) setSvg({ value, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}` });
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [value]);

  async function downloadPng() {
    const url = await QRCode.toDataURL(value, { width: 1024, margin: 2, errorCorrectionLevel: "M" });
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (error) return <p className="ls-error">Impossibile generare il QR code (link troppo lungo?).</p>;

  return (
    <div className="ls-qr">
      {svg && svg.value === value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="ls-qr-img" src={svg.src} alt={alt} width={220} height={220} />
      ) : (
        <div className="ls-qr-img" style={{ aspectRatio: "1" }} aria-hidden="true" />
      )}
      <div className="ls-row ls-noprint" style={{ justifyContent: "center" }}>
        <button type="button" className="ls-btn ls-btn--small" onClick={downloadPng} disabled={!svg}>
          Scarica PNG
        </button>
        <button type="button" className="ls-btn ls-btn--small" onClick={() => window.print()}>
          Stampa
        </button>
      </div>
    </div>
  );
}
