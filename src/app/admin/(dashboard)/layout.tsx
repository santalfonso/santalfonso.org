import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/actions/login";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articoli", label: "Articoli" },
  { href: "/admin/eventi", label: "Eventi" },
  { href: "/admin/risorse", label: "Risorse" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-stone-100">
      <header className="bg-stone-900 text-stone-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-bold">Amministrazione</span>
            <nav className="flex flex-wrap gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-amber-300"
                >
                  {item.label}
                </Link>
              ))}
              {session.user.role === "admin" && (
                <Link href="/admin/utenti" className="hover:text-amber-300">
                  Utenti
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-stone-400">
              {session.user.name} ({session.user.role})
            </span>
            <Link href="/" className="hover:text-amber-300">
              Vai al sito
            </Link>
            <form action={logoutAction}>
              <button className="rounded bg-stone-700 px-3 py-1 hover:bg-stone-600">
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
