"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articoli", label: "Articoli" },
  { href: "/admin/eventi", label: "Eventi" },
  { href: "/admin/risorse", label: "Risorse" },
];

const ownerOnlyItems = [
  { href: "/admin/canti", label: "Canti" },
  { href: "/admin/utenti", label: "Utenti" },
  { href: "/admin/configurazioni", label: "Configurazioni" },
];

export default function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="admin-nav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-nav-link${isActive(item.href) ? " active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
      {isOwner &&
        ownerOnlyItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link${isActive(item.href) ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
    </nav>
  );
}
