"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MOMENTS, SEASONS } from "@/lib/lodate/constants";

/** Menù laterale di "Lodate, lodate Iddio": a sinistra su schermi larghi, a scomparsa sul telefono. */
export default function LodateSidebar({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const onCatalog = pathname === "/lodate";
  const momento = onCatalog ? params.get("momento") : null;
  const tempo = onCatalog ? params.get("tempo") : null;

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
      <button
        type="button"
        className="lodate-side__toggle"
        aria-expanded={open}
        aria-controls="lodate-side-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menù dei canti
      </button>

      <nav id="lodate-side-menu" className="lodate-side__menu">
        <p className="lodate-side__group">Canti</p>
        <ul>
          {item("/lodate", "Tutti i canti", onCatalog && !momento && !tempo)}
          {item("/lodate/scaletta", "Prepara una scaletta", pathname.startsWith("/lodate/scaletta"))}
          {loggedIn
            ? item("/lodate/area", "Le mie scalette e preferiti", pathname.startsWith("/lodate/area"))
            : item(`/accedi?next=${encodeURIComponent("/lodate/area")}`, "Le mie scalette (accedi)", false)}
          {item("/lodate/letture", "Letture del giorno", pathname.startsWith("/lodate/letture"))}
        </ul>

        <p className="lodate-side__group">Momenti della Messa</p>
        <ul>{MOMENTS.map((m) => item(`/lodate?momento=${m.slug}`, m.label, momento === m.slug))}</ul>

        <p className="lodate-side__group">Tempi e occasioni</p>
        <ul>{SEASONS.map((s) => item(`/lodate?tempo=${s.slug}`, s.label, tempo === s.slug))}</ul>
      </nav>
    </aside>
  );
}
