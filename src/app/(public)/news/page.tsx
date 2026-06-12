import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import PageTitle from "@/components/PageTitle";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const list = await db.query.articles.findMany({
    where: eq(articles.published, true),
    orderBy: [desc(articles.publishedAt)],
  });

  return (
    <>
      <PageTitle title="News" subtitle="Le notizie dalla vita della parrocchia" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {list.length === 0 ? (
          <p className="text-stone-500">Nessuna notizia pubblicata al momento.</p>
        ) : (
          <div className="space-y-6">
            {list.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row"
              >
                {article.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImageUrl}
                    alt=""
                    className="h-40 w-full rounded object-cover sm:h-32 sm:w-48"
                  />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    {formatDate(article.publishedAt)}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-stone-800 group-hover:text-amber-800">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-3 text-stone-600">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
