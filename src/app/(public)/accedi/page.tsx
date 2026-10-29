import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PageTitle from "@/components/PageTitle";
import { safeNext } from "@/lib/safe-next";
import LoginForm from "./LoginForm";
import "@/app/lodate.css";
import "@/app/lodate-scalette.css";

export const metadata: Metadata = {
  title: "Accedi",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AccediPage({ searchParams }: { searchParams: SearchParams }) {
  const next = safeNext((await searchParams).next);
  const session = await auth();
  if (session?.user?.id) redirect(next);

  return (
    <>
      <PageTitle kicker="Area riservata" title="Accedi" />
      <div className="container-narrow lodate" style={{ paddingBottom: 64 }}>
        <div className="ls" style={{ maxWidth: 480, margin: 0, padding: 0 }}>
          <div className="ls-card ls-stack">
            <p className="ls-muted">
              Con l&apos;account della parrocchia puoi usare le funzioni riservate del sito: per esempio salvare
              le scalette dei canti, i canti preferiti e le annotazioni.
            </p>
            <LoginForm next={next} />
            <p className="ls-note ls-small ls-login-note">
              Non hai un account? Non è prevista la registrazione online:{" "}
              <strong>chiedi un account all&apos;amministratore del sito</strong>.
            </p>
            <p className="ls-small">
              Puoi comunque{" "}
              <Link className="ls-link" href="/lodate/scaletta">
                preparare una scaletta senza account
              </Link>{" "}
              e condividerla con un link.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
