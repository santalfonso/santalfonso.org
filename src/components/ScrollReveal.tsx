"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Card e foto che compaiono con una dissolvenza leggera quando entrano nello schermo. */
const TARGETS = ".card, .ris-cat, main figure, main img";
/** Escluse: lo slideshow della homepage, le schede aperte (eventi, avvisi) e chi chiede di non animare. */
const EXCLUDE = ".hero, [role='dialog'], .ev-overlay, .no-reveal";
/** Dopo l'animazione si tolgono le classi, così tornano gli effetti al passaggio del mouse delle card. */
const CLEANUP_MS = 1300;

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Lodate è un'applicazione di lavoro (canti, scalette): niente animazioni
    if (pathname.startsWith("/lodate")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    const main = document.querySelector("main");
    if (!main) return;

    const found = Array.from(main.querySelectorAll<HTMLElement>(TARGETS)).filter(
      (el) => !el.closest(EXCLUDE) && !(el.tagName === "IMG" && el.getBoundingClientRect().width < 120),
    );
    // una card con foto si anima tutta insieme: niente animazioni annidate
    const set = new Set(found);
    const targets = found.filter((el) => {
      for (let p = el.parentElement; p && p !== main; p = p.parentElement) if (set.has(p)) return false;
      return true;
    });
    // solo ciò che è ancora sotto lo schermo: quello già visibile resta com'è, senza lampeggiare
    const below = targets.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    if (below.length === 0) return;

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return ra.top - rb.top || ra.left - rb.left;
          });
        // gli elementi che entrano insieme (una riga di card) arrivano uno dopo l'altro
        visible.forEach((el, i) => {
          observer.unobserve(el);
          el.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 80}ms`);
          el.classList.add("is-visible");
          timers.push(
            window.setTimeout(() => {
              el.classList.remove("reveal", "is-visible");
              el.style.removeProperty("--reveal-delay");
            }, CLEANUP_MS + Math.min(i, 5) * 80),
          );
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );

    for (const el of below) {
      el.classList.add("reveal");
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      for (const el of below) {
        el.classList.remove("reveal", "is-visible");
        el.style.removeProperty("--reveal-delay");
      }
    };
  }, [pathname]);

  return null;
}
