import Link from "next/link";
import { desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { articles, events } from "@/db/schema";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestArticles, upcomingEvents] = await Promise.all([
    db.query.articles.findMany({
      where: eq(articles.published, true),
      orderBy: [desc(articles.publishedAt)],
      limit: 3,
    }),
    db.query.events.findMany({
      where: gte(events.startsAt, new Date().toISOString()),
      orderBy: [events.startsAt],
      limit: 5,
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-900 to-amber-800 text-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-bold sm:text-5xl">
            Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg italic text-amber-100">
            «Chi prega si salva, chi non prega si danna!»
          </p>
          <p className="mt-2 text-sm text-amber-200">
            — Sant&apos;Alfonso Maria de&apos; Liguori
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/news"
              className="rounded bg-white px-6 py-3 font-semibold text-amber-900 shadow hover:bg-amber-50"
            >
              Ultime notizie
            </Link>
            <Link
              href="/contatti"
              className="rounded border border-amber-200 px-6 py-3 font-semibold hover:bg-amber-800"
            >
              Contattaci
            </Link>
          </div>
        </div>
      </section>

      {/* Ultime notizie */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-amber-900">Ultime notizie</h2>
          <Link href="/news" className="text-sm text-amber-700 hover:underline">
            Tutte le news →
          </Link>
        </div>
        {latestArticles.length === 0 ? (
          <p className="text-stone-500">Nessuna notizia pubblicata al momento.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {article.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImageUrl}
                    alt=""
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    {formatDate(article.publishedAt)}
                  </p>
                  <h3 className="mt-1 font-semibold text-stone-800 group-hover:text-amber-800">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Prossimi eventi */}
      <section className="bg-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold text-amber-900">
            Prossimi eventi
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-stone-500">
              Nessun evento in programma al momento.
            </p>
          ) : (
            <ul className="space-y-4">
              {upcomingEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-amber-700">
                    {formatDateTime(event.startsAt)}
                    {event.endsAt ? ` — ${formatDateTime(event.endsAt)}` : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-stone-800">
                    {event.title}
                  </h3>
                  {event.location && (
                    <p className="text-sm text-stone-500">📍 {event.location}</p>
                  )}
                  {event.description && (
                    <p className="mt-2 text-sm text-stone-600">
                      {event.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Orari e informazioni */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-amber-900">
              Sante Messe
            </h3>
            <p className="text-stone-700">
              <strong>Feriali:</strong> 8:00 e 18:30
              <br />
              <strong>Festivi:</strong> 8:30 · 10:30 · 12:00 · 18:30
            </p>
            <p className="mt-3 text-sm text-stone-500">
              La messa delle 10:30 della domenica è dedicata alle famiglie e ai
              bambini del catechismo.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-amber-900">
              Ufficio parrocchiale
            </h3>
            <p className="text-stone-700">
              <strong>Feriali:</strong> 17:00 – 18:30
            </p>
            <p className="mt-3 text-sm text-stone-500">
              Per prenotazioni di sacramenti e richieste di certificati.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-amber-900">
              Dove siamo
            </h3>
            <p className="text-stone-700">
              Via della Giustiniana, 227
              <br />
              00188 Roma (RM)
              <br />
              Tel. +39 06 3320803
            </p>
            <Link
              href="/dove-siamo"
              className="mt-3 inline-block text-sm text-amber-700 hover:underline"
            >
              Come raggiungerci →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
