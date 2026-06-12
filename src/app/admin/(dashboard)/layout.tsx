import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/actions/login";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand__mark">A</span>
            <span>Admin</span>
          </Link>
          <AdminNav isAdmin={session.user.role === "admin"} />
          <div className="admin-header-right">
            <span className="admin-user-badge">
              {session.user.name} · {session.user.role}
            </span>
            <Link href="/" className="admin-header-link">
              Vai al sito ↗
            </Link>
            <form action={logoutAction}>
              <button className="admin-logout-btn">Esci</button>
            </form>
          </div>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
