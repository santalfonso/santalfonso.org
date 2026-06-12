import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import PageTitle from "@/components/PageTitle";
import { formatDate, formatFileSize } from "@/lib/utils";

export const metadata: Metadata = { title: "Risorse" };
export const dynamic = "force-dynamic";

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

  return (
    <>
      <PageTitle
        title="Risorse"
        subtitle="Libretti, documenti e materiali della parrocchia da scaricare"
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {list.length === 0 ? (
          <p className="text-stone-500">
            Nessuna risorsa disponibile al momento.
          </p>
        ) : (
          [...byCategory.entries()].map(([category, items]) => (
            <section key={category} className="mb-10">
              <h2 className="mb-4 text-2xl font-bold text-amber-900">
                {category}
              </h2>
              <ul className="space-y-3">
                {items.map((resource) => (
                  <li
                    key={resource.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-stone-800">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-stone-600">
                          {resource.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-stone-400">
                        {resource.fileName}
                        {resource.fileSize
                          ? ` · ${formatFileSize(resource.fileSize)}`
                          : ""}
                        {" · "}
                        {formatDate(resource.createdAt)}
                      </p>
                    </div>
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded bg-amber-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-amber-800"
                    >
                      Scarica
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
