import { requireOwnerPage } from "@/auth";
import { getSetting } from "@/lib/settings";
import ConfigurazioniForm from "@/components/admin/ConfigurazioniForm";

export const dynamic = "force-dynamic";

export default async function ConfigurazioniPage() {
  await requireOwnerPage();

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
