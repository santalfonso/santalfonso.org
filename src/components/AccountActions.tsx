"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutSiteAction } from "@/actions/account";
import ChangePasswordForm from "@/components/ChangePasswordForm";

/**
 * Scheda dell'area personale: email e ruolo (`children`), pulsanti per il pannello (solo staff),
 * il cambio password a scomparsa e l'uscita; il modulo della password si apre sotto la scheda.
 */
export default function AccountActions({
  admin,
  minLength,
  children,
}: {
  admin: boolean;
  minLength: number;
  children: React.ReactNode;
}) {
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <>
      <div className="ls-card ls-stack">
        {children}
        <div className="ls-row">
          {admin && (
            <Link className="ls-btn ls-btn--primary" href="/admin">
              Pannello amministrativo
            </Link>
          )}
          <button
            type="button"
            className="ls-btn"
            aria-expanded={passwordOpen}
            aria-controls="cambia-password-pannello"
            onClick={() => setPasswordOpen((o) => !o)}
          >
            Cambia password
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              style={{
                marginLeft: 6,
                transition: "transform 200ms",
                transform: passwordOpen ? "rotate(180deg)" : "none",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </button>
          <form action={logoutSiteAction}>
            <button type="submit" className="ls-btn">
              Esci
            </button>
          </form>
        </div>
      </div>
      <div id="cambia-password-pannello" hidden={!passwordOpen}>
        <ChangePasswordForm minLength={minLength} />
      </div>
    </>
  );
}
