"use client";

import { useRef, useState } from "react";

type ExistingImage = { id: number; url: string };

export default function GalleryEditor({ existing }: { existing: ExistingImage[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<Set<number>>(new Set());
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [dragging, setDragging] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    if (!added.length) return;

    setPreviews((prev) => {
      const next = [...prev, ...added];
      const dt = new DataTransfer();
      next.forEach((p) => dt.items.add(p.file));
      if (inputRef.current) inputRef.current.files = dt.files;
      return next;
    });
  }

  function removeNew(index: number) {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const dt = new DataTransfer();
      next.forEach((p) => dt.items.add(p.file));
      if (inputRef.current) inputRef.current.files = dt.files;
      return next;
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
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 8,
                    opacity: marked ? 0.3 : 1,
                    border: marked ? "2px solid var(--error, #e53)" : "2px solid transparent",
                    transition: "opacity 0.15s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleDelete(img.id)}
                  title={marked ? "Annulla rimozione" : "Rimuovi"}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "none",
                    background: marked ? "var(--azure-deep)" : "rgba(0,0,0,0.5)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {marked ? "↩" : "×"}
                </button>
                {marked && (
                  <input type="hidden" name="deleteImageId" value={img.id} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Nuove immagini in anteprima */}
      {previews.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {previews.map((p, i) => (
            <div key={i} style={{ position: "relative", width: 100, height: 100 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.preview}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
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
          padding: "28px 24px",
          cursor: "pointer",
          textAlign: "center",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <div style={{ fontSize: 22, opacity: 0.4, marginBottom: 6 }}>⬆</div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--ink-soft)" }}>
          Trascina le foto qui oppure clicca per aggiungere
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-mute)" }}>
          Puoi selezionare più file — verranno convertite in AVIF
        </p>
      </div>

      {(visibleExisting.length > 0 || previews.length > 0) && (
        <p className="admin-input-hint">
          {visibleExisting.length + previews.length} foto in galleria
          {toDelete.size > 0 ? ` · ${toDelete.size} da rimuovere` : ""}
        </p>
      )}

      <input
        ref={inputRef}
        name="galleryImages"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => addFiles(e.target.files)}
        style={{ display: "none" }}
      />
    </div>
  );
}
