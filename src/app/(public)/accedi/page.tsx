import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PageTitle from "@/components/PageTitle";
import { safeNext } from "@/lib/safe-next";
import LoginForm from "./LoginForm";
import AccountRequest from "./AccountRequest";
import { getRecaptchaSiteKey } from "@/lib/contact-config";
import "@/app/lodate.css";
import "@/app/lodate-scalette.css";

export const metadata: Metadata = {
  title: "Accedi",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AccediPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const passwordSet = params.esito === "password-impostata";
  const session = await auth();
  if (session?.user?.id) redirect(next);
  const siteKey = await getRecaptchaSiteKey();

  return (
    <>
      <PageTitle kicker="Area riservata" title="Accedi" />
      <div className="container-narrow lodate" style={{ paddingBottom: 64 }}>
        <div className="ls" style={{ maxWidth: 480, margin: 0, padding: 0 }}>
          <div className="ls-card ls-stack">
            {passwordSet && (
              <p className="ls-note" role="status" style={{ fontWeight: 600 }}>
                Password salvata: ora accedi con la tua email e la nuova password.
              </p>
            )}
            <p className="ls-muted">
              Con l&apos;account della parrocchia puoi usare le funzioni riservate del sito: per esempio salvare
              le scalette dei canti, i canti preferiti e le annotazioni.
            </p>
            <LoginForm next={next} />
            <div className="ls-login-note ls-stack">
              <p className="ls-note ls-small" style={{ margin: 0 }}>
                Non hai un account? Non è prevista la registrazione online.
              </p>
              <AccountRequest siteKey={siteKey} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
