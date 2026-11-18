import { requireOwnerPage } from "@/auth";
import SettingsTabs from "@/components/admin/SettingsTabs";

/** Impostazioni (solo owner): Configurazioni e Aggiornamenti, con le schede in alto. */
export default async function ImpostazioniLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return (
    <>
      <div className="admin-page-head">
        <h1>Impostazioni</h1>
      </div>
      <SettingsTabs />
      {children}
    </>
  );
}
