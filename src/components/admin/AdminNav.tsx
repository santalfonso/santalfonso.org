"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articoli", label: "Articoli" },
  { href: "/admin/eventi", label: "Eventi" },
  { href: "/admin/risorse", label: "Risorse" },
];

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
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
      {isAdmin && (
        <Link
          href="/admin/utenti"
          className={`admin-nav-link${isActive("/admin/utenti") ? " active" : ""}`}
        >
          Utenti
        </Link>
      )}
    </nav>
  );
}
