"use client";

import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

type Props = {
  name: string;
  currentUrl?: string | null;
  label: string;
  focusInputName?: string;
  currentFocus?: string | null;
  onUploadingChange?: (uploading: boolean) => void;
};

function parseFocus(value: string | null | undefined): { x: number; y: number } {
  if (!value) return { x: 50, y: 50 };
  const m = value.match(/([\d.]+)%\s+([\d.]+)%/);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 50, y: 50 };
}

export default function ImageDropzone({
  name, currentUrl, label, focusInputName, currentFocus, onUploadingChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [focus, setFocus] = useState(() => parseFocus(currentFocus));

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
    setUploadError(null);
    setUploading(true);
    onUploadingChange?.(true);

    uploadToCloudinary(file, "santalfonso")
      .then((url) => {
        setUploadedUrl(url);
        setUploading(false);
        onUploadingChange?.(false);
      })
      .catch((err) => {
        setUploadError(err.message ?? "Upload non riuscito");
        setUploading(false);
        onUploadingChange?.(false);
      });
  }

  function handleFocusClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocus({ x, y });
  }

  const displayUrl = preview ?? currentUrl ?? null;

  return (
    <div className="admin-form-row">
      <label className="admin-label">
        {label}
        {currentUrl && !preview ? " (sostituisce quella attuale)" : ""}
      </label>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        style={{
          border: `2px dashed ${dragging ? "var(--azure-deep)" : "var(--border)"}`,
          borderRadius: "var(--r-md, 10px)",
          background: dragging ? "var(--azure-soft)" : "var(--bg-soft)",
          padding: displayUrl ? 0 : "40px 24px",
          cursor: uploading ? "default" : "pointer",
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

            {/* Overlay upload in corso */}
            {uploading && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <span className="admin-spinner admin-spinner--lg" />
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
                  Caricamento…
                </span>
              </div>
            )}

            {/* Overlay hover (solo se non in upload) */}
            {!uploading && (
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0)", opacity: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
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
            )}
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

      {uploadError && (
        <p style={{ marginTop: 6, fontSize: 12, color: "#e53" }}>
          Errore: {uploadError}
        </p>
      )}

      {/* Focal point picker */}
      {focusInputName && displayUrl && !uploading && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 6, fontWeight: 500 }}>
            Punto di messa a fuoco — clicca sull&apos;anteprima per spostarlo
          </div>
          <div
            onClick={handleFocusClick}
            style={{
              position: "relative", cursor: "crosshair",
              borderRadius: 8, overflow: "hidden",
              border: "1px solid var(--rule)", userSelect: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt=""
              style={{
                width: "100%", height: 120, objectFit: "cover",
                objectPosition: `${focus.x}% ${focus.y}%`,
                display: "block", pointerEvents: "none",
              }}
            />
            <div style={{
              position: "absolute",
              left: `${focus.x}%`, top: `${focus.y}%`,
              transform: "translate(-50%, -50%)",
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid #fff", background: "var(--azure)",
              opacity: 0.9, boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }} />
          </div>
          <input type="hidden" name={focusInputName} value={`${focus.x}% ${focus.y}%`} />
        </div>
      )}

      {/* URL caricata su Cloudinary — letta dalla Server Action */}
      <input type="hidden" name={name} value={uploadedUrl ?? ""} />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        style={{ display: "none" }}
      />
    </div>
  );
}
