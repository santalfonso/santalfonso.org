"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = { name?: string | null };

/**
 * Accesso all'area riservata, uguale in tutto il sito. La sessione si legge dal
 * client (/api/auth/session) così le pagine statiche restano statiche.
 */
export default function AccountLink() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: SessionUser } | null) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const label = user ? `Il mio account${user.name ? ` (${user.name})` : ""}` : "Accedi";
  const href = user
    ? "/area"
    : `/accedi${pathname && pathname !== "/" && !pathname.startsWith("/accedi") ? `?next=${encodeURIComponent(pathname)}` : ""}`;

  return (
    <Link href={href} className="icon-btn" aria-label={label} title={label}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    </Link>
  );
}
