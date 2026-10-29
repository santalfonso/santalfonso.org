"use client";

import { useState, useTransition } from "react";
import { setFavorite } from "@/actions/lodate/favorites";

/** Cuore per aggiungere o togliere un canto dai preferiti (solo utenti con accesso). */
export default function FavoriteHeart({
  songId,
  title,
  initial,
}: {
  songId: number;
  title: string;
  initial: boolean;
}) {
  const [favorite, setFav] = useState(initial);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !favorite;
    setFav(next);
    startTransition(async () => {
      try {
        const res = await setFavorite(songId, next);
        if ("error" in res) setFav(!next);
      } catch {
        setFav(!next);
      }
    });
  };

  return (
    <button
      type="button"
      className={`lodate-heart${favorite ? " is-on" : ""}`}
      aria-pressed={favorite}
      aria-label={favorite ? `Togli «${title}» dai preferiti` : `Aggiungi «${title}» ai preferiti`}
      title={favorite ? "Nei preferiti" : "Aggiungi ai preferiti"}
      disabled={pending}
      onClick={toggle}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2.1 0 3.5 1.2 5.1 3 1.6-1.8 3-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
          fill={favorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
