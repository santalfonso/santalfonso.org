"use client";

import { useState, useEffect, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  // useRef evita problemi di stale closure: l'evento è sempre quello catturato
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pwa-install-dismissed")) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-install-dismissed", "1");
    setShow(false);
  }

  async function install() {
    const p = promptRef.current;
    if (!p) return;
    promptRef.current = null;
    await p.prompt();
    const { outcome } = await p.userChoice;
    if (outcome === "accepted") localStorage.setItem("pwa-install-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      width: "calc(100% - 32px)",
      maxWidth: 460,
      background: "var(--bg)",
      border: "1px solid var(--rule)",
      borderRadius: "var(--r-lg)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      zIndex: 9999,
      animation: "hero-slide-right 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/apple-touch-icon.png"
        alt=""
        style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", lineHeight: 1.3 }}>
          Parrocchia Sant&apos;Alfonso
        </div>
        {isIOS ? (
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 3, lineHeight: 1.4 }}>
            Tocca <strong>Condividi</strong>{" "}
            <span style={{ fontSize: 14 }}>⎋</span>{" "}
            poi <strong>&ldquo;Aggiungi a schermata Home&rdquo;</strong>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 3 }}>
            Installa l&apos;app per un accesso rapido
          </div>
        )}
      </div>
      {!isIOS && (
        <button
          onClick={install}
          className="btn btn--primary"
          style={{ fontSize: 13, padding: "8px 16px", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Installa
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Chiudi"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--ink-mute)", fontSize: 22, padding: "0 4px",
          flexShrink: 0, lineHeight: 1, display: "flex", alignItems: "center",
        }}
      >
        ×
      </button>
    </div>
  );
}
