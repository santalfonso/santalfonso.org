"use client";

import Link from "next/link";
import { useState } from "react";

const parrocchiaItems = [
  { href: "/parrocchia/storia", label: "Storia della comunità" },
  { href: "/parrocchia/gruppi-parrocchiali", label: "Gruppi parrocchiali" },
  { href: "/parrocchia/servizi-parrocchiali", label: "Servizi parrocchiali" },
  { href: "/parrocchia/santo-titolare", label: "Santo titolare" },
  { href: "/parrocchia/visite-pontefici", label: "Visite pontefici" },
];

const menuItems = [
  { href: "/news", label: "News" },
  { href: "/risorse", label: "Risorse" },
  { href: "/dove-siamo", label: "Dove siamo" },
  { href: "/contatti", label: "Contatti" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-amber-900 text-amber-50 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex flex-col" onClick={() => setMobileOpen(false)}>
          <span className="text-lg font-bold leading-tight sm:text-xl">
            Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori
          </span>
          <span className="text-xs text-amber-200">Prima Porta · Roma</span>
        </Link>

        <button
          className="rounded p-2 hover:bg-amber-800 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Apri menù"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="hover:text-amber-200">
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-amber-200">
              La nostra parrocchia
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 top-full z-20 w-60 rounded-b bg-white py-2 text-stone-800 shadow-lg">
                {parrocchiaItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 hover:bg-amber-50 hover:text-amber-900"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-amber-200">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="border-t border-amber-800 bg-amber-900 px-4 pb-4 lg:hidden">
          <Link href="/" className="block py-2" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <p className="py-2 text-sm font-semibold uppercase text-amber-300">
            La nostra parrocchia
          </p>
          {parrocchiaItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 pl-4"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
