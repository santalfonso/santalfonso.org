"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Pulsante "Condividi" del canto: WhatsApp, Telegram, email, link e (sul telefono) le altre app. */
export default function ShareMenu({ title, path }: { title: string; path: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(path);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function toggle() {
    if (!open) {
      // indirizzo completo del sito su cui si è (anteprima o dominio definitivo)
      setUrl(new URL(path, window.location.origin).toString());
      setCanNativeShare(typeof navigator.share === "function");
      setCopied(false);
    }
    setOpen((o) => !o);
  }

  // Si chiude toccando fuori o con Esc.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const text = `${title} — Lodate, lodate Iddio`;
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, icon: <WhatsAppIcon /> },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      icon: <TelegramIcon />,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
      icon: <MailIcon />,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      return;
    } catch {
      // appunti non permessi (browser vecchi o pagine incorporate): copia alla vecchia maniera
    }
    const area = document.createElement("textarea");
    area.value = url;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (ok) setCopied(true);
    else window.prompt("Copia il link del canto:", url);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
      setOpen(false);
    } catch {
      // annullata dall'utente: il menù resta aperto
    }
  }

  return (
    <div className="lodate-share" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`lodate-btn${open ? " is-on" : ""}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      >
        <ShareIcon /> Condividi
      </button>
      {open && (
        <div id={menuId} className="lodate-share__menu">
          <ul>
            {links.map((l) => (
              <li key={l.label}>
                <a className="lodate-share__item" href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                  {l.icon} {l.label}
                </a>
              </li>
            ))}
            <li>
              <button type="button" className="lodate-share__item" onClick={copyLink}>
                <LinkIcon /> {copied ? "Link copiato" : "Copia link"}
              </button>
            </li>
            {canNativeShare && (
              <li>
                <button type="button" className="lodate-share__item" onClick={nativeShare}>
                  <MoreIcon /> Altre app…
                </button>
              </li>
            )}
          </ul>
          <p className="lodate-sr" role="status" aria-live="polite">
            {copied ? "Link del canto copiato negli appunti" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="lodate-share__wa">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.2-.4.6-1.3a.4.4 0 000-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="lodate-share__tg">
      <path d="M21.4 3.6L2.9 10.7c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8s.6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.4zM9.6 13.4l8.6-5.4c.4-.3.8-.1.5.2l-7.4 6.7-.3 3.2-1.4-4.7z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 6.5L12 13l8.5-6.5" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1 1M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1-1" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}
