"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SEASONS } from "@/lib/lodate/constants";

/**
 * Menù laterale di "Lodate, lodate Iddio": a sinistra su schermi larghi; sul telefono
 * si apre dal pulsante a tre righe come pannello che scorre da sinistra.
 */
export default function LodateSidebar({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Pannello aperto: niente scorrimento della pagina sotto, Esc chiude, focus dentro il pannello.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onCatalog = pathname === "/lodate";
  const tempo = onCatalog ? params.get("tempo") : null;

  // Sezione corrente, mostrata nella barra del menù sul telefono.
  const current = onCatalog
    ? (SEASONS.find((x) => x.slug === tempo)?.label ?? "Repertorio")
    : pathname.startsWith("/lodate/canti/")
      ? "Canto"
      : pathname.startsWith("/lodate/scaletta") || pathname.startsWith("/lodate/s/")
        ? "Scaletta"
        : pathname.startsWith("/lodate/letture")
          ? "Letture del giorno"
          : pathname.startsWith("/lodate/area")
            ? "Le mie scalette"
            : "";

  const item = (href: string, label: string, active: boolean) => (
    <li key={href}>
      <Link
        href={href}
        className={`lodate-side__link${active ? " active" : ""}`}
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <aside className={`lodate-side${open ? " is-open" : ""}`} aria-label="Menù dei canti">
      <div className="lodate-side__bar">
        <button
          ref={toggleRef}
          type="button"
          className="lodate-side__toggle"
          aria-expanded={open}
          aria-controls="lodate-side-menu"
          onClick={() => setOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="lodate-side__bar-title">Menù dei canti</span>
          {current && (
            <span className="lodate-side__bar-current">
              <span className="lodate-sr">, sezione attuale: </span>
              {current}
            </span>
          )}
        </button>
      </div>

      <div
        className="lodate-side__backdrop"
        aria-hidden="true"
        onClick={() => {
          setOpen(false);
          toggleRef.current?.focus();
        }}
      />

      <nav id="lodate-side-menu" className="lodate-side__menu" aria-label="Menù dei canti">
        <div className="lodate-side__drawer-head">
          <span>
            Lodate, lodate{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Iddio
            </span>
          </span>
          <button
            ref={closeRef}
            type="button"
            className="lodate-side__close"
            aria-label="Chiudi il menù dei canti"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p className="lodate-side__group">Canti</p>
        <ul>
          {item("/lodate", "Repertorio", onCatalog && !params.get("momento") && !tempo)}
          {item("/lodate/scaletta", "Prepara una scaletta", pathname.startsWith("/lodate/scaletta"))}
          {loggedIn && item("/lodate/area", "Le mie scalette e preferiti", pathname.startsWith("/lodate/area"))}
          {item("/lodate/letture", "Letture del giorno", pathname.startsWith("/lodate/letture"))}
        </ul>

        <p className="lodate-side__group">Tempi e occasioni</p>
        <ul>{SEASONS.map((s) => item(`/lodate?tempo=${s.slug}`, s.label, tempo === s.slug))}</ul>
      </nav>
    </aside>
  );
}
