import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isStaff } from "@/auth";
import { logoutSiteAction } from "@/actions/account";
import PageTitle from "@/components/PageTitle";
import "@/app/lodate.css";
import "@/app/lodate-scalette.css";

export const metadata: Metadata = {
  title: "Il mio account",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { admin: "Amministratore", editor: "Editor", utente: "Utente registrato" } as const;

export default async function AreaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/accedi?next=/area");
  const { name, email, role } = session.user;

  return (
    <>
      <PageTitle kicker="Area riservata" title={`Ciao${name ? `, ${name}` : ""}`} />
      <div className="container-narrow lodate" style={{ paddingBottom: 64 }}>
        <div className="ls ls-stack" style={{ maxWidth: 560, margin: 0, padding: 0 }}>
          <div className="ls-card ls-stack">
            <p className="ls-muted">
              {email}
              {role ? ` · ${ROLE_LABEL[role]}` : ""}
            </p>
            <div className="ls-row">
              <Link className="ls-btn ls-btn--primary" href="/lodate/area">
                Le mie scalette e i canti preferiti
              </Link>
              {isStaff(role) && (
                <Link className="ls-btn" href="/admin">
                  Amministrazione
                </Link>
              )}
              <form action={logoutSiteAction}>
                <button type="submit" className="ls-btn">
                  Esci
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
