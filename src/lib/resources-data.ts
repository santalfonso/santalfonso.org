import { asc } from "drizzle-orm";
import { db } from "@/db";
import { resourceCategories, resources, type Resource, type ResourceCategory } from "@/db/schema";

const byTitle = new Intl.Collator("it", { numeric: true, sensitivity: "base" });

export type CategoryWithFiles = ResourceCategory & { files: Resource[] };

/**
 * Categorie della pagina Risorse in ordine, ognuna con i suoi file ordinati per titolo
 * (i numeri contano come numeri: "2015" viene prima di "2023"). Solo lato server.
 */
export async function getCategoriesWithFiles(): Promise<{ categories: CategoryWithFiles[]; uncategorized: Resource[] }> {
  const [categories, files] = await Promise.all([
    db.select().from(resourceCategories).orderBy(asc(resourceCategories.position), asc(resourceCategories.id)),
    db.select().from(resources),
  ]);
  files.sort((a, b) => byTitle.compare(a.title, b.title));
  const ids = new Set(categories.map((c) => c.id));
  return {
    categories: categories.map((c) => ({ ...c, files: files.filter((f) => f.categoryId === c.id) })),
    // file caricati prima delle categorie: restano visibili finché non vengono spostati o eliminati
    uncategorized: files.filter((f) => f.categoryId === null || !ids.has(f.categoryId)),
  };
}
