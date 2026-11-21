import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { findValidToken, minPasswordLength } from "@/lib/password-token";
import { ROLE_LABEL } from "@/lib/roles";
import SetPasswordForm from "./SetPasswordForm";
import "@/app/lodate.css";
import "@/app/lodate-scalette.css";

export const metadata: Metadata = {
  title: "Scegli la password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default async function ImpostaPasswordPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const owner = await findValidToken(t);

  return (
    <>
      <PageTitle kicker="Area riservata" title="Scegli la password" />
      <div className="container-narrow lodate" style={{ paddingBottom: 64 }}>
        <div className="ls" style={{ maxWidth: 480, margin: 0, padding: 0 }}>
          <div className="ls-card ls-stack">
            {owner ? (
              <>
                <p className="ls-muted">
                  Ciao <strong>{owner.name}</strong>, scegli la password per il tuo account ({ROLE_LABEL[owner.role]}).
                  Dopo il salvataggio entrerai subito nel sito.
                </p>
                <SetPasswordForm token={t!} email={owner.email} minLength={minPasswordLength(owner.role)} />
              </>
            ) : (
              <>
                <p className="ls-error" role="alert">
                  Il link non è valido, è scaduto o è già stato usato.
                </p>
                <p className="ls-muted">
                  Se hai già scelto la password puoi <Link className="ls-link" href="/accedi">accedere</Link>.
                  Altrimenti chiedi un nuovo link all&apos;amministratore del sito.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
