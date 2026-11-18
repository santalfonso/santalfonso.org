"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Ricarica i dati della pagina ogni `seconds` secondi finché `active` è vero (es. aggiornamento in corso). */
export default function AutoRefresh({ active, seconds = 10 }: { active: boolean; seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => router.refresh(), seconds * 1000);
    return () => window.clearInterval(id);
  }, [active, seconds, router]);
  return null;
}
