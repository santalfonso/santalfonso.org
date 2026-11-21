"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SETTINGS_ITEMS } from "@/lib/admin-settings-nav";
import { roleAtLeast, type Role } from "@/lib/roles";

/** Voci del menù del backend con il ruolo minimo che le vede. */
const NAV_ITEMS: { href: string; label: string; min: Role }[] = [
  { href: "/admin", label: "Dashboard", min: "editor" },
  { href: "/admin/articoli", label: "Articoli", min: "editor" },
  { href: "/admin/eventi", label: "Eventi", min: "editor" },
  { href: "/admin/risorse", label: "Risorse", min: "superadmin" },
  { href: "/admin/canti", label: "Canti", min: "superadmin" },
  { href: "/admin/utenti", label: "Utenti", min: "superadmin" },
];

export function navItemsFor(role: Role | undefined) {
  return NAV_ITEMS.filter((item) => roleAtLeast(role, item.min));
}

export default function AdminNav({ role }: { role: Role | undefined }) {
  const isOwner = role === "owner";
  const pathname = usePathname();
  // il menù resta aperto solo sulla pagina in cui è stato aperto: cambiando pagina si chiude
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean | ((o: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(open) : value;
    setOpenAt(next ? pathname : null);
  };
  const menuRef = useRef<HTMLDivElement>(null);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  // si chiude cliccando fuori o con Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = navItemsFor(role);

  return (
    <nav className="admin-nav">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-nav-link${isActive(item.href) ? " active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
      {isOwner && (
        <div className="admin-nav-menu" ref={menuRef}>
          <button
            type="button"
            className={`admin-nav-link admin-nav-menu__btn${isActive("/admin/impostazioni") ? " active" : ""}`}
            aria-expanded={open}
            aria-controls="admin-settings-menu"
            onClick={() => setOpen((o) => !o)}
          >
            Impostazioni
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div id="admin-settings-menu" className="admin-nav-menu__list" hidden={!open}>
            {SETTINGS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-menu__item${isActive(item.href) ? " active" : ""}`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
