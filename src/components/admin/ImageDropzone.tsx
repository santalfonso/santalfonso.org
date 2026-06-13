"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  currentUrl?: string | null;
  label: string;
};

export default function ImageDropzone({ name, currentUrl, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const displayUrl = preview ?? currentUrl ?? null;

  return (
    <div className="admin-form-row">
      <label className="admin-label">
        {label}
        {currentUrl && !preview ? " (sostituisce quella attuale)" : ""}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--azure-deep)" : "var(--border)"}`,
          borderRadius: "var(--r-md, 10px)",
          background: dragging ? "var(--azure-soft)" : "var(--bg-soft)",
          padding: displayUrl ? 0 : "40px 24px",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Anteprima"
              style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.opacity = "1";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.opacity = "0";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)";
              }}
            >
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                Cambia immagine
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>⬆</div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}>
              Trascina un&apos;immagine qui
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-mute)" }}>
              oppure clicca per scegliere — verrà convertita in AVIF
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
