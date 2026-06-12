import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { formatDate, formatFileSize } from "@/lib/utils";

export const metadata: Metadata = { title: "Risorse" };
export const dynamic = "force-dynamic";

function fileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 4 ? ext : "File";
}

export default async function RisorsePage() {
  const list = await db.query.resources.findMany({
    orderBy: [desc(resources.createdAt)],
  });

  const byCategory = new Map<string, typeof list>();
  for (const resource of list) {
    const group = byCategory.get(resource.category) ?? [];
    group.push(resource);
    byCategory.set(resource.category, group);
  }
  const categories = [...byCategory.entries()];

  return (
    <>
      <section style={{ paddingTop: 64, paddingBottom: 48 }}>
        <div className="container-narrow">
          <span className="kicker">Risorse</span>
          <h1 style={{ marginTop: 20 }}>
            Libretti, documenti e materiali per il{" "}
            <span style={{ color: "var(--azure-deep)" }}>cammino</span>.
          </h1>
          <p className="lead" style={{ marginTop: 20 }}>
            Una raccolta in continuo aggiornamento: i libretti dei
            festeggiamenti della Madonna del Rosario, documenti e materiali
            della parrocchia da scaricare.
          </p>
        </div>
      </section>

      {categories.length > 1 && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="cats">
              {categories.map(([category, items], i) => (
                <a key={category} href={`#cat-${i}`} className="card">
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      background: i % 2 === 0 ? "var(--azure-soft)" : "var(--gold-soft)",
                      color: i % 2 === 0 ? "var(--azure-deep)" : "var(--gold-deep)",
                      borderRadius: "var(--r-pill)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {items.length} {items.length === 1 ? "elemento" : "elementi"}
                  </div>
                  <h3 style={{ marginTop: 14, fontSize: 19 }}>{category}</h3>
                  <span
                    className="btn--link"
                    style={{ marginTop: 14, display: "inline-flex" }}
                  >
                    Esplora →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ paddingTop: categories.length > 1 ? undefined : 0 }}>
        <div className="container">
          {list.length === 0 ? (
            <p className="muted">Nessuna risorsa disponibile al momento.</p>
          ) : (
            categories.map(([category, items], i) => (
              <div key={category} id={`cat-${i}`} style={{ marginBottom: i < categories.length - 1 ? 56 : 0 }}>
                <div className="section-header" style={{ marginBottom: 28 }}>
                  <div>
                    <span className="kicker">{category}</span>
                    <h2 style={{ marginTop: 14, fontSize: "clamp(22px, 2.6vw, 30px)" }}>
                      {category}
                    </h2>
                  </div>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  {items.map((resource, j, arr) => (
                    <a
                      key={resource.id}
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "70px 1fr auto",
                        gap: 20,
                        padding: "18px 24px",
                        borderBottom: j < arr.length - 1 ? "1px solid var(--rule)" : "0",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--azure-deep)",
                          background: "var(--azure-soft)",
                          padding: "5px 0",
                          textAlign: "center",
                          borderRadius: "var(--r-pill)",
                        }}
                      >
                        {fileType(resource.fileName)}
                      </span>
                      <div>
                        <h4 style={{ fontSize: 16, marginBottom: 4 }}>
                          {resource.title}
                        </h4>
                        <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                          {resource.description
                            ? `${resource.description} · `
                            : ""}
                          {formatFileSize(resource.fileSize) || resource.fileName}
                          {" · "}
                          {formatDate(resource.createdAt)}
                        </span>
                      </div>
                      <span style={{ fontSize: 18, color: "var(--ink-mute)" }}>↓</span>
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
