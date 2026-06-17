"use client";

import { useState, useEffect } from "react";
import { subscribeUser } from "@/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotifPromptBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    // Se l'utente ha bloccato esplicitamente le notifiche non possiamo fare nulla
    if (Notification.permission === "denied") return;
    // Nella stessa sessione l'utente ha già chiuso il banner, non riaprirlo
    if (sessionStorage.getItem("notif-banner-seen")) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!standalone) return;

    // Mostra solo se non c'è già una subscription attiva
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (!sub) setShow(true); })
      .catch(() => {});
  }, []);

  function dismiss() {
    sessionStorage.setItem("notif-banner-seen", "1");
    setShow(false);
  }

  async function enable() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { dismiss(); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      await subscribeUser(JSON.parse(JSON.stringify(sub)));
      setShow(false);
    } catch {
      dismiss();
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return (
    <>
    <div
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        background: "rgba(0,0,0,0.15)",
        zIndex: 9998,
        animation: "fade-in 0.25s ease both",
      }}
    />
    <div style={{
      position: "fixed",
      bottom: 88,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      padding: "0 16px",
      zIndex: 9999,
      pointerEvents: "none",
      animation: "hero-slide-right 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 460,
        background: "var(--bg)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--r-lg)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        pointerEvents: "auto",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #1F7AE0, #3399FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", lineHeight: 1.3 }}>
            Attiva le notifiche
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 3, lineHeight: 1.4 }}>
            Ricevi aggiornamenti su avvisi e notizie della parrocchia
          </div>
        </div>
        <button
          onClick={enable}
          disabled={loading}
          className="btn btn--primary"
          style={{ fontSize: 13, padding: "8px 16px", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          {loading ? "..." : "Attiva"}
        </button>
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
    </div>
    </>
  );
}
