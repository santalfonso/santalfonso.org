"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SEASONS } from "@/lib/lodate/constants";

/**
 * Menù di "Lodate, lodate Iddio": a sinistra su schermi larghi; sul telefono una fila
 * di pulsanti grandi in alto (Repertorio, Nuova scaletta, Letture, Preferiti).
 */
export default function LodateSidebar({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();

  const onCatalog = pathname === "/lodate";
  const tempo = onCatalog ? params.get("tempo") : null;

  const item = (href: string, label: string, active: boolean) => (
    <li key={href}>
      <Link href={href} className={`lodate-side__link${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
        {label}
      </Link>
    </li>
  );

  const tabs = [
    {
      href: "/lodate",
      label: "Repertorio",
      active: onCatalog || pathname.startsWith("/lodate/canti/"),
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z" />,
    },
    {
      href: "/lodate/scaletta",
      label: "Nuova scaletta",
      active: pathname.startsWith("/lodate/scaletta"),
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h11M4 12h11M4 18h7M18 15v6M15 18h6" />,
    },
    {
      href: "/lodate/letture",
      label: "Letture del giorno",
      active: pathname.startsWith("/lodate/letture"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.5C10.3 5.2 7.9 4.5 4 4.5v13c3.9 0 6.3.7 8 2m0-13c1.7-1.3 4.1-2 8-2v13c-3.9 0-6.3.7-8 2m0-13v13"
        />
      ),
    },
    ...(loggedIn
      ? [
          {
            href: "/lodate/area",
            label: "Preferiti",
            active: pathname.startsWith("/lodate/area"),
            icon: (
              <path
                strokeLinejoin="round"
                d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2.1 0 3.5 1.2 5.1 3 1.6-1.8 3-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <aside className="lodate-side" aria-label="Menù dei canti">
      {/* Telefono: pulsanti grandi, quello della pagina attuale in evidenza */}
      <nav className="lodate-tabs" aria-label="Sezioni dei canti">
        <ul style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`lodate-tab${t.active ? " is-active" : ""}`}
                aria-current={t.active ? "page" : undefined}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  {t.icon}
                </svg>
                <span>{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Schermi larghi: menù laterale */}
      <nav className="lodate-side__menu" aria-label="Menù dei canti">
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
