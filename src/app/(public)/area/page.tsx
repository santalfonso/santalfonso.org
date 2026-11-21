import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, isStaff, ROLE_LABEL } from "@/auth";
import AccountActions from "@/components/AccountActions";
import PageTitle from "@/components/PageTitle";
import "@/app/lodate.css";
import "@/app/lodate-scalette.css";

export const metadata: Metadata = {
  title: "Il mio account",
  robots: { index: false, follow: false },
};


export default async function AreaPage({ searchParams }: { searchParams: Promise<{ esito?: string }> }) {
  const esito = (await searchParams).esito;
  const passwordChanged = esito === "password-cambiata";
  const passwordSet = esito === "password-impostata";
  const session = await auth();
  if (!session?.user?.id) redirect("/accedi?next=/area");
  const { name, email, role } = session.user;

  return (
    <>
      <PageTitle kicker="Area riservata" title={`Ciao${name ? `, ${name}` : ""}`} />
      <div className="container-narrow lodate" style={{ paddingBottom: 64 }}>
        <div className="ls ls-stack" style={{ maxWidth: 560, margin: 0, padding: 0 }}>
          {passwordChanged && (
            <p className="ls-card" role="status" style={{ margin: 0, fontWeight: 600 }}>
              Password cambiata. Gli altri dispositivi dovranno accedere di nuovo.
            </p>
          )}
          {passwordSet && (
            <p className="ls-card" role="status" style={{ margin: 0, fontWeight: 600 }}>
              Password salvata: benvenuto nel sito della parrocchia!
            </p>
          )}
          <AccountActions admin={isStaff(role)} minLength={isStaff(role) ? 12 : 8}>
            <p className="ls-muted">
              {email}
              {role ? ` · ${ROLE_LABEL[role]}` : ""}
            </p>
          </AccountActions>
        </div>
      </div>
    </>
  );
}
