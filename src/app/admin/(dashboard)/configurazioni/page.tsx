import { requireOwnerPage } from "@/auth";
import { getSetting } from "@/lib/settings";
import { getContactConfig } from "@/lib/contact-config";
import ConfigurazioniForm from "@/components/admin/ConfigurazioniForm";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";

export const dynamic = "force-dynamic";

export default async function ConfigurazioniPage() {
  await requireOwnerPage();

  const groqKey = await getSetting("groq_api_key");
  const contact = await getContactConfig();

  return (
    <>
      <div className="admin-page-head">
        <h1>Configurazioni</h1>
      </div>
      <ConfigurazioniForm hasGroqKey={!!groqKey} />
      <ContactSettingsForm
        smtpHost={contact.smtpHost ?? "smtps.aruba.it"}
        smtpPort={contact.smtpPort}
        smtpUser={contact.smtpUser ?? "info@santalfonso.org"}
        hasSmtpPassword={!!contact.smtpPassword}
        recaptchaSiteKey={contact.recaptchaSiteKey ?? ""}
        hasRecaptchaSecret={!!contact.recaptchaSecretKey}
        hasResendKey={!!contact.resendApiKey}
      />
    </>
  );
}
