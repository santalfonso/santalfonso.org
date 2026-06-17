"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface StoredNotif {
  id: number;
  title: string;
  body: string;
  url: string;
  receivedAt: string;
  read: boolean;
}

function openNotifDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("santalfonso-notifications", 1);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore("notifications", {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

async function readAll(): Promise<StoredNotif[]> {
  const db = await openNotifDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("notifications", "readonly")
      .objectStore("notifications")
      .getAll();
    req.onsuccess = () => resolve((req.result as StoredNotif[]).reverse());
    req.onerror = () => reject(req.error);
  });
}

async function markAllRead(notifications: StoredNotif[]): Promise<void> {
  const unread = notifications.filter((n) => !n.read);
  if (unread.length === 0) return;
  const db = await openNotifDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notifications", "readwrite");
    const store = tx.objectStore("notifications");
    unread.forEach((n) => store.put({ ...n, read: true }));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteOne(id: number): Promise<void> {
  const db = await openNotifDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notifications", "readwrite");
    tx.objectStore("notifications").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Adesso";
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} or${h === 1 ? "a" : "e"} fa`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Ieri";
  if (d < 7) return `${d} giorni fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<StoredNotif[]>([]);
  const [supported, setSupported] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const all = await readAll();
      setNotifs(all);
    } catch {
      // IndexedDB non disponibile
    }
  }, []);

  useEffect(() => {
    if (!("indexedDB" in window)) return;
    setSupported(true);
    refresh();

    // Aggiorna badge quando arriva una nuova notifica dal SW
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "NEW_NOTIFICATION") refresh();
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    window.addEventListener("focus", refresh);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", onMessage);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  async function handleOpen() {
    setOpen(true);
    await markAllRead(notifs);
    await refresh();
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteOne(id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  function handleClick(notif: StoredNotif) {
    setOpen(false);
    router.push(notif.url);
  }

  const unread = notifs.filter((n) => !n.read).length;

  if (!supported) return null;

  return (
    <>
      {/* Pulsante campanella */}
      <button
        className="icon-btn notif-btn"
        aria-label="Centro notifiche"
        onClick={handleOpen}
        style={{ position: "relative" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: -4, right: -4,
            minWidth: 16, height: 16,
            borderRadius: 8,
            background: "var(--gold)",
            color: "#0F1419",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
            lineHeight: 1,
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Sheet notifiche */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 500,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(100vw, 380px)",
              maxHeight: "90dvh",
              background: "var(--bg)",
              borderRadius: "0 0 0 var(--r-lg)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              animation: "sheet-right 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both",
            }}
          >
            {/* Intestazione */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 20px 16px",
              borderBottom: "1px solid var(--rule)",
              flexShrink: 0,
            }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
                Notifiche
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--ink-mute)", fontSize: 22, lineHeight: 1,
                  padding: "0 2px",
                }}
              >
                ×
              </button>
            </div>

            {/* Lista */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifs.length === 0 ? (
                <div style={{
                  padding: 40, textAlign: "center",
                  color: "var(--ink-mute)", fontSize: 14,
                }}>
                  Nessuna notifica ricevuta
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--rule)",
                      cursor: "pointer",
                      background: n.read ? "transparent" : "color-mix(in oklab, var(--gold) 8%, transparent)",
                      transition: "background var(--t)",
                    }}
                  >
                    {!n.read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "var(--gold)",
                        flexShrink: 0,
                        marginTop: 5,
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0, marginLeft: n.read ? 20 : 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 14,
                        color: "var(--ink)", lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div style={{
                          fontSize: 13, color: "var(--ink-mute)",
                          marginTop: 3, lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        } as React.CSSProperties}>
                          {n.body}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 5 }}>
                        {relativeTime(n.receivedAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      aria-label="Elimina"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--ink-mute)", fontSize: 18, padding: "0 2px",
                        flexShrink: 0, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
