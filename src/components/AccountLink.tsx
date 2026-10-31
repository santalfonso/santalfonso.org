"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type SessionUser = { name?: string | null };

/** Pagine da cui passano accesso e uscita: lasciandole lo stato dell'account può essere cambiato. */
const AUTH_PAGES = /^\/(accedi|area|admin|lodate\/accedi)(\/|$)/;
/** Tornando sulla scheda, ricontrollo al massimo ogni 5 minuti (sessione scaduta o chiusa altrove). */
const RECHECK_MS = 5 * 60 * 1000;

/**
 * Accesso all'area riservata, uguale in tutto il sito. La sessione si legge dal
 * client (/api/auth/session) così le pagine statiche restano statiche; non a ogni
 * cambio di pagina, ma solo quando può essere cambiata.
 */
export default function AccountLink() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const lastCheck = useRef(0);
  const request = useRef(0);
  const prevPath = useRef<string | null>(null);

  const check = useCallback(() => {
    const id = ++request.current;
    lastCheck.current = Date.now();
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: SessionUser } | null) => {
        if (id === request.current) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (id === request.current) setUser(null);
      });
  }, []);

  useEffect(() => {
    const prev = prevPath.current;
    prevPath.current = pathname;
    if (prev === null || AUTH_PAGES.test(prev) || AUTH_PAGES.test(pathname)) check();
  }, [pathname, check]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastCheck.current > RECHECK_MS) check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [check]);

  const label = user ? `Il mio account${user.name ? ` (${user.name})` : ""}` : "Accedi";
  const href = user
    ? "/area"
    : `/accedi${pathname && pathname !== "/" && !pathname.startsWith("/accedi") ? `?next=${encodeURIComponent(pathname)}` : ""}`;

  return (
    <Link
      href={href}
      className="icon-btn"
      aria-label={label}
      title={label}
      onClick={(e) => {
        // dopo l'accesso si torna alla pagina esatta, compresi ?d= (scaletta), ?data= e i filtri
        if (user || !window.location.search || window.location.pathname.startsWith("/accedi")) return;
        e.preventDefault();
        router.push(`/accedi?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    </Link>
  );
}
