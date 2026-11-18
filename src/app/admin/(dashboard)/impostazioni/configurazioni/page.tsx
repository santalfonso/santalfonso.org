import type { Metadata } from "next";
import { requireOwnerPage } from "@/auth";
import { getSetting } from "@/lib/settings";
import { getContactConfig } from "@/lib/contact-config";
import ConfigurazioniForm from "@/components/admin/ConfigurazioniForm";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";
import GithubTokenForm from "@/components/admin/GithubTokenForm";
import { GITHUB_TOKEN_KEY, repoSlug } from "@/lib/github-updates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Configurazioni" };

export default async function ConfigurazioniPage() {
  await requireOwnerPage();

  const groqKey = await getSetting("groq_api_key");
  const githubToken = await getSetting(GITHUB_TOKEN_KEY);
  const contact = await getContactConfig();

  return (
    <>
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
      <GithubTokenForm hasToken={!!githubToken} repo={repoSlug()} />
    </>
  );
}
