"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_ITEMS } from "@/lib/admin-settings-nav";

export default function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav className="admin-tabs" aria-label="Impostazioni">
      {SETTINGS_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-tab${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
