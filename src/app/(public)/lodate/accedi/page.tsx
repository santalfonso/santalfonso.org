import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** Vecchio indirizzo dell'accesso: l'accesso ora è unico per tutto il sito. */
export default async function LodateAccediRedirect({ searchParams }: { searchParams: SearchParams }) {
  const next = (await searchParams).next;
  const value = Array.isArray(next) ? next[0] : next;
  redirect(value ? `/accedi?next=${encodeURIComponent(value)}` : "/accedi");
}
