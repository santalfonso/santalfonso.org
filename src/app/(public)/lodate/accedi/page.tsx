import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";
import "@/app/lodate-scalette.css";

export const metadata: Metadata = {
  title: "Accedi",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** Stesso controllo dell'action: solo percorsi interni /lodate… */
function safeNext(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v || v.length > 2000 || !/^\/lodate(?:[/?#]|$)/.test(v)) return "/lodate/area";
  if (/[\\\u0000-\u001F\u007F]/.test(v) || v.includes("//")) return "/lodate/area";
  return v;
}

export default async function AccediPage({ searchParams }: { searchParams: SearchParams }) {
  const next = safeNext((await searchParams).next);
  const session = await auth();
  if (session?.user?.id) redirect(next);

  return (
    <div className="ls" style={{ maxWidth: 480 }}>
      <div className="ls-card ls-stack">
        <header>
          <span className="ls-kicker">Area cantori</span>
          <h1>Accedi</h1>
          <p className="ls-muted">
            Con l&apos;account puoi salvare le scalette, ritrovarle nell&apos;area personale e tenere i
            canti preferiti.
          </p>
        </header>
        <LoginForm next={next} />
        <p className="ls-note ls-small">
          Non hai un account? Non è prevista la registrazione online:{" "}
          <strong>chiedi un account al parroco/amministratore</strong>.
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
  );
}
