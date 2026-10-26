"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CatalogSubnav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/lodate", label: "Canti", match: (p: string) => p === "/lodate" || p.startsWith("/lodate/canti") },
    { href: "/lodate/scaletta", label: "Scaletta", match: (p: string) => p.startsWith("/lodate/scaletta") || p.startsWith("/lodate/s/") },
    { href: "/lodate/letture", label: "Letture", match: (p: string) => p.startsWith("/lodate/letture") },
    loggedIn
      ? { href: "/lodate/area", label: "Area personale", match: (p: string) => p.startsWith("/lodate/area") }
      : {
          href: `/lodate/accedi${pathname && pathname !== "/lodate/accedi" ? `?next=${encodeURIComponent(pathname)}` : ""}`,
          label: "Accedi",
          match: (p: string) => p.startsWith("/lodate/accedi"),
        },
  ];

  return (
    <nav className="lodate-subnav" aria-label="Lodate, lodate Iddio">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`lodate-subnav__item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
