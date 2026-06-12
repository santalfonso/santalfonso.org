import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSetting } from "@/actions/settings";
import ConfigurazioniForm from "@/components/admin/ConfigurazioniForm";

export const dynamic = "force-dynamic";

export default async function ConfigurazioniPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin");

  const groqKey = await getSetting("groq_api_key");

  return (
    <>
      <div className="admin-page-head">
        <h1>Configurazioni</h1>
      </div>
      <ConfigurazioniForm hasGroqKey={!!groqKey} />
    </>
  );
}
