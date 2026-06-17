"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/login";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div
      className="admin"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        className="admin-card"
        style={{ width: "100%", maxWidth: 440 }}
      >
        <div className="admin-card-body">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dark.avif"
              alt="Sant'Alfonso"
              style={{ height: 48, width: "auto", margin: "0 auto 20px", display: "block" }}
            />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Area riservata
            </h1>
            <p
              style={{
                marginTop: 6,
                fontSize: 14,
                color: "var(--ink-mute)",
              }}
            >
              Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori
            </p>
          </div>

          <form action={formAction}>
            <div className="admin-form-row">
              <label htmlFor="email" className="admin-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="admin-input"
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="password" className="admin-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="admin-input"
              />
            </div>

            {state?.error && (
              <div className="admin-error" style={{ marginBottom: 16 }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="admin-btn admin-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {pending ? "Accesso in corso…" : "Accedi"}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 13 }}>
            <Link href="/" className="admin-header-link" style={{ color: "var(--ink-mute)" }}>
              ← Torna al sito
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
