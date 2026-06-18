"use client";

import { useEffect, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

type ExistingImage = { id: number; url: string };

type NewImage = {
  uid: string;
  preview: string;
  state: "uploading" | "done" | "error";
  url: string | null;
  errorMsg: string | null;
};

type Props = {
  existing: ExistingImage[];
  onUploadingChange?: (uploading: boolean) => void;
};

export default function GalleryEditor({ existing, onUploadingChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<Set<number>>(new Set());
  const [images, setImages] = useState<NewImage[]>([]);
  const [dragging, setDragging] = useState(false);

  const uploadingCount = images.filter((i) => i.state === "uploading").length;

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0);
  }, [uploadingCount, onUploadingChange]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!added.length) return;

    const entries: NewImage[] = added.map((f) => ({
      uid: `${Date.now()}-${Math.random()}`,
      preview: URL.createObjectURL(f),
      state: "uploading",
      url: null,
      errorMsg: null,
    }));

    setImages((prev) => [...prev, ...entries]);

    entries.forEach((entry, i) => {
      uploadToCloudinary(added[i], "santalfonso")
        .then((url) =>
          setImages((prev) =>
            prev.map((img) =>
              img.uid === entry.uid ? { ...img, state: "done", url } : img,
            ),
          ),
        )
        .catch((err) =>
          setImages((prev) =>
            prev.map((img) =>
              img.uid === entry.uid
                ? { ...img, state: "error", errorMsg: err.message }
                : img,
            ),
          ),
        );
    });
  }

  function removeNew(uid: string) {
    setImages((prev) => {
      const item = prev.find((i) => i.uid === uid);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.uid !== uid);
    });
  }

  function toggleDelete(id: number) {
    setToDelete((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const visibleExisting = existing.filter((img) => !toDelete.has(img.id));
  const errorCount = images.filter((i) => i.state === "error").length;
  const doneCount = images.filter((i) => i.state === "done").length;

  return (
    <div className="admin-form-row">
      <label className="admin-label">Galleria fotografica</label>

      {/* Immagini esistenti */}
      {existing.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {existing.map((img) => {
            const marked = toDelete.has(img.id);
            return (
              <div key={img.id} style={{ position: "relative", width: 100, height: 100 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", borderRadius: 8,
                    opacity: marked ? 0.3 : 1,
                    border: marked ? "2px solid #e53" : "2px solid transparent",
                    transition: "opacity 0.15s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleDelete(img.id)}
                  title={marked ? "Annulla rimozione" : "Rimuovi"}
                  style={iconBtn(marked ? "var(--azure-deep)" : "rgba(0,0,0,0.5)")}
                >
                  {marked ? "↩" : "×"}
                </button>
                {marked && <input type="hidden" name="deleteImageId" value={img.id} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Nuove immagini */}
      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {images.map((img) => (
            <div key={img.uid} style={{ position: "relative", width: 100, height: 100 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt=""
                style={{
                  width: "100%", height: "100%", objectFit: "cover", borderRadius: 8,
                  opacity: img.state === "done" ? 1 : 0.55,
                  border: img.state === "error" ? "2px solid #e53" : "2px solid transparent",
                }}
              />

              {/* Overlay stato */}
              {img.state === "uploading" && (
                <div style={overlay()}>
                  <span className="admin-spinner" />
                </div>
              )}
              {img.state === "error" && (
                <div style={overlay("rgba(200,40,40,0.45)")}>
                  <span style={{ color: "#fff", fontSize: 20 }}>✕</span>
                </div>
              )}
              {img.state === "done" && (
                <span style={{
                  position: "absolute", bottom: 5, right: 5,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "var(--azure-deep)", color: "#fff",
                  fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✓</span>
              )}

              {/* Rimuovi (solo se non in corso) */}
              {img.state !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeNew(img.uid)}
                  title="Rimuovi"
                  style={iconBtn()}
                >×</button>
              )}

              {/* URL per il form — solo se caricata */}
              {img.state === "done" && img.url && (
                <input type="hidden" name="galleryImageUrl" value={img.url} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragging ? "var(--azure-deep)" : "var(--border)"}`,
          borderRadius: "var(--r-md, 10px)",
          background: dragging ? "var(--azure-soft)" : "var(--bg-soft)",
          padding: "28px 24px", cursor: "pointer", textAlign: "center",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <div style={{ fontSize: 22, opacity: 0.4, marginBottom: 6 }}>⬆</div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--ink-soft)" }}>
          Trascina le foto qui oppure clicca per aggiungere
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-mute)" }}>
          {uploadingCount > 0
            ? `Caricamento in corso: ${uploadingCount} foto…`
            : "Puoi selezionare più file — verranno convertite in AVIF"}
        </p>
      </div>

      {errorCount > 0 && (
        <p style={{ marginTop: 6, fontSize: 12, color: "#e53" }}>
          {errorCount} foto non caricate — rimuovile e riprova.
        </p>
      )}

      {(visibleExisting.length > 0 || doneCount > 0) && (
        <p className="admin-input-hint">
          {visibleExisting.length + doneCount} foto in galleria
          {toDelete.size > 0 ? ` · ${toDelete.size} da rimuovere` : ""}
          {uploadingCount > 0 ? ` · ${uploadingCount} in caricamento…` : ""}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => addFiles(e.target.files)}
        style={{ display: "none" }}
      />
    </div>
  );
}

function iconBtn(bg = "rgba(0,0,0,0.5)"): React.CSSProperties {
  return {
    position: "absolute", top: 4, right: 4,
    width: 22, height: 22, borderRadius: "50%",
    border: "none", background: bg, color: "#fff",
    cursor: "pointer", fontSize: 14, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}

function overlay(bg = "rgba(0,0,0,0.3)"): React.CSSProperties {
  return {
    position: "absolute", inset: 0, borderRadius: 8,
    background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}
