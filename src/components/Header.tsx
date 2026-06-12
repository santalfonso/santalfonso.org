"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
];

const topbarItems = [
  { href: "/dove-siamo", label: "Dove siamo" },
  { href: "/contatti", label: "Contatti" },
];

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light"
    );
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("sa-theme", next);
  };

  const inParrocchia = pathname.startsWith("/parrocchia");

  return (
    <>
    <div className="topbar">
      <div className="container">
        <nav className="topbar__nav">
          {topbarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
    <header className="site-header">
      <div className="container">
        <div className="site-header__bar">
          <Link href="/" className="brand">
            <img
              src={theme === "dark" ? "/logo-dark.avif" : "/logo-light.avif"}
              alt="Sant'Alfonso"
              className="brand__logo"
            />
          </Link>

          <nav className="nav">
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              Home
            </Link>
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                className={`nav-item ${inParrocchia ? "active" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                La nostra parrocchia
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown">
                  {parrocchiaItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={pathname === item.href ? "active" : ""}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname.startsWith(item.href) ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="icon-btn"
              aria-label="Cambia tema"
              title="Cambia tema"
              onClick={toggleTheme}
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
            <button
              className="icon-btn mobile-toggle"
              aria-label="Apri menù"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <span className="mobile-nav__group">La nostra parrocchia</span>
          {parrocchiaItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          <span className="mobile-nav__group">Sito</span>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          {topbarItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
    </>
  );
}
