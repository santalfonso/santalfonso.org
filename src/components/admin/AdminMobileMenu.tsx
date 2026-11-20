"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, ownerOnlyItems } from "@/components/admin/AdminNav";
import { SETTINGS_ITEMS } from "@/lib/admin-settings-nav";

/**
 * Menù a panino del backend su schermi stretti: pannello laterale da destra con tutte
 * le voci, Impostazioni comprese, e in fondo "Vai al sito" ed "Esci" (passato come children).
 */
export default function AdminMobileMenu({
  isOwner,
  userLabel,
  children,
}: {
  isOwner: boolean;
  userLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // aperto solo sulla pagina in cui è stato aperto: cambiando pagina si chiude
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const items = isOwner ? [...navItems, ...ownerOnlyItems] : navItems;

  return (
    <>
      <button
        type="button"
        className="admin-burger"
        aria-label={open ? "Chiudi il menù" : "Apri il menù"}
        aria-expanded={open}
        aria-controls="admin-drawer"
        onClick={() => setOpenAt(open ? null : pathname)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div className={`admin-drawer-backdrop${open ? " is-open" : ""}`} onClick={() => setOpenAt(null)} aria-hidden="true" />
      <aside
        id="admin-drawer"
        className={`admin-drawer${open ? " is-open" : ""}`}
        aria-label="Menù del backend"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="admin-drawer__head">
          <span className="admin-drawer__user">{userLabel}</span>
          <button type="button" className="admin-drawer__close" aria-label="Chiudi il menù" onClick={() => setOpenAt(null)}>
            ×
          </button>
        </div>

        <nav className="admin-drawer__nav">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-drawer__link${isActive(item.href) ? " active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {isOwner && (
            <>
              <span className="admin-drawer__group">Impostazioni</span>
              {SETTINGS_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-drawer__link admin-drawer__link--sub${isActive(item.href) ? " active" : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="admin-drawer__foot">{children}</div>
      </aside>
    </>
  );
}
