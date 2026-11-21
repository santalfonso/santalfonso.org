/**
 * Email HTML del form contatti, nei colori del sito. Layout a tabelle e stili in linea:
 * è l'unico modo che funziona bene in Gmail, Outlook e nella Webmail Aruba.
 */
const LOGO = "https://res.cloudinary.com/dksk2bjyd/image/upload/c_limit,w_440/santalfonso/email/logo.png";
const SITE = "https://www.santalfonso.org";

const C = {
  bg: "#F5F7FA",
  card: "#FFFFFF",
  ink: "#0F1419",
  inkSoft: "#4A5160",
  inkMute: "#8A92A1",
  rule: "#EAEDF1",
  azure: "#1F7AE0",
  azureSoft: "#EAF4FF",
  gold: "#C9A24A",
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

/** Testo libero: escape, a capo mantenuti. */
function paragraphs(s: string): string {
  return esc(s).replace(/\r?\n/g, "<br>");
}

function romeDate(d = new Date()): string {
  return d.toLocaleString("it-IT", { timeZone: "Europe/Rome", dateStyle: "full", timeStyle: "short" });
}

function layout(opts: { preheader: string; kicker: string; title: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
      <tr><td align="center" style="padding:0 0 24px;">
        <a href="${SITE}" style="text-decoration:none;"><img src="${LOGO}" width="220" alt="Parrocchia Sant'Alfonso Maria de' Liguori" style="display:block;width:220px;max-width:100%;height:auto;border:0;"></a>
      </td></tr>
      <tr><td style="background:${C.card};border:1px solid ${C.rule};border-radius:14px;overflow:hidden;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="height:4px;line-height:4px;font-size:0;background:${C.azure};background-image:linear-gradient(90deg, ${C.azure}, #3399FF);">&nbsp;</td></tr>
          <tr><td style="padding:32px 32px 8px;font-family:${FONT};">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.azure};">${esc(opts.kicker)}</div>
            <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:${C.ink};">${esc(opts.title)}</h1>
          </td></tr>
          <tr><td style="padding:16px 32px 32px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.inkSoft};">
            ${opts.body}
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:24px 16px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.inkMute};">
        ${opts.footer}<br>
        Parrocchia Sant'Alfonso Maria de' Liguori · Via della Giustiniana, 227 · 00188 Roma<br>
        <a href="${SITE}" style="color:${C.inkMute};">santalfonso.org</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function row(label: string, valueHtml: string): string {
  return `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${C.rule};width:90px;vertical-align:top;font-size:13px;font-weight:600;color:${C.inkMute};">${label}</td>
  <td style="padding:10px 0;border-bottom:1px solid ${C.rule};vertical-align:top;font-size:15px;color:${C.ink};">${valueHtml}</td>
</tr>`;
}

export type ContactMessage = { name: string; email: string; subject: string; message: string };

/** Messaggio inviato dal form della pagina Contatti. */
export function contactEmailHtml(m: ContactMessage): string {
  const replyHref = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject || "Messaggio dal sito"}`)}`;
  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${row("Nome", esc(m.name))}
  ${row("Email", `<a href="mailto:${esc(m.email)}" style="color:${C.azure};text-decoration:none;">${esc(m.email)}</a>`)}
  ${m.subject ? row("Oggetto", esc(m.subject)) : ""}
  ${row("Ricevuto", esc(romeDate()))}
</table>
<div style="margin:24px 0 0;padding:20px 22px;background:${C.bg};border-left:3px solid ${C.gold};border-radius:6px;font-size:15px;line-height:1.7;color:${C.ink};">
  ${paragraphs(m.message)}
</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
  <tr><td style="border-radius:999px;background:${C.azure};">
    <a href="${replyHref}" style="display:inline-block;padding:12px 26px;font-family:${FONT};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">Rispondi a ${esc(m.name)}</a>
  </td></tr>
</table>`;
  return layout({
    preheader: `${m.name}: ${m.message.slice(0, 120)}`,
    kicker: "Nuovo messaggio dal sito",
    title: m.subject || "Messaggio dal form contatti",
    body,
    footer: "Ricevuto tramite il form della pagina Contatti. Puoi rispondere direttamente a questa email.",
  });
}

/** Email di prova da Admin → Configurazioni. */
export function testEmailHtml(service: string, by: string | null | undefined): string {
  const body = `
<p style="margin:0 0 16px;">Se leggi questo messaggio, il form della pagina Contatti è pronto: i messaggi dei visitatori arriveranno a questo indirizzo con questa grafica.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${row("Servizio", esc(service))}
  ${by ? row("Inviata da", esc(by)) : ""}
  ${row("Data", esc(romeDate()))}
</table>`;
  return layout({
    preheader: "Il form contatti del sito è pronto.",
    kicker: "Email di prova",
    title: "Il form contatti funziona",
    body,
    footer: "Inviata da Admin → Configurazioni.",
  });
}

export type AccountRequest = { name: string; email: string; message: string; alreadyRegistered: boolean };

/** Richiesta di un account dalla pagina Accedi, per l'amministratore del sito. */
export function accountRequestEmailHtml(r: AccountRequest): string {
  const replyHref = `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent("Il tuo account sul sito della parrocchia")}`;
  const notice = r.alreadyRegistered
    ? `<div style="margin:0 0 20px;padding:12px 16px;background:#FFF6E5;border:1px solid #F2D9A6;border-radius:8px;font-size:14px;line-height:1.5;color:#7A5300;">
  <strong>Attenzione:</strong> esiste già un account con questa email. Forse la persona ha dimenticato la password.
</div>`
    : "";
  const message = r.message
    ? `<div style="margin:24px 0 0;font-size:13px;font-weight:600;color:${C.inkMute};">Messaggio</div>
<div style="margin:8px 0 0;padding:20px 22px;background:${C.bg};border-left:3px solid ${C.gold};border-radius:6px;font-size:15px;line-height:1.7;color:${C.ink};">
  ${paragraphs(r.message)}
</div>`
    : `<p style="margin:24px 0 0;font-size:14px;color:${C.inkMute};">Nessun messaggio aggiunto alla richiesta.</p>`;
  const body = `
${notice}<p style="margin:0 0 16px;">Una persona chiede un account per accedere alle funzioni riservate del sito (scalette dei canti, preferiti, annotazioni). Puoi confermarla assegnando un ruolo in <strong>Amministrazione → Utenti</strong>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${row("Nome", esc(r.name))}
  ${row("Email", `<a href="mailto:${esc(r.email)}" style="color:${C.azure};text-decoration:none;">${esc(r.email)}</a>`)}
  ${row("Ricevuta", esc(romeDate()))}
</table>
${message}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
  <tr>
    <td style="border-radius:999px;background:${C.azure};">
      <a href="${SITE}/admin/utenti" style="display:inline-block;padding:12px 26px;font-family:${FONT};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">Apri le richieste</a>
    </td>
    <td style="width:12px;">&nbsp;</td>
    <td style="border-radius:999px;border:1px solid ${C.rule};">
      <a href="${replyHref}" style="display:inline-block;padding:11px 22px;font-family:${FONT};font-size:15px;font-weight:600;color:${C.ink};text-decoration:none;border-radius:999px;">Rispondi</a>
    </td>
  </tr>
</table>`;
  return layout({
    preheader: `${r.name} (${r.email}) chiede un account sul sito.`,
    kicker: "Richiesta di account",
    title: `${r.name} chiede un account`,
    body,
    footer: "Ricevuta tramite il form della pagina Accedi. Puoi rispondere direttamente a questa email.",
  });
}

export type WelcomeEmail = {
  name: string;
  roleLabel: string;
  link: string;
  days: number;
  minLength: number;
  /** true: nuovo link per un account già esistente (password dimenticata o link scaduto) */
  reset?: boolean;
};

/** Email al titolare di un account appena confermato, con il link per scegliere la password. */
export function welcomeEmailHtml(w: WelcomeEmail): string {
  const body = `
<p style="margin:0 0 16px;">Ciao ${esc(w.name)},</p>
<p style="margin:0 0 16px;">${
    w.reset
      ? "l'amministratore del sito ti ha inviato un nuovo link per scegliere la password del tuo account sul sito della Parrocchia Sant'Alfonso Maria de' Liguori."
      : "la tua richiesta è stata accolta: il tuo account sul sito della Parrocchia Sant'Alfonso Maria de' Liguori è pronto. Per iniziare a usarlo scegli la tua password."
  }</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${row("Ruolo", esc(w.roleLabel))}
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
  <tr><td style="border-radius:999px;background:${C.azure};">
    <a href="${esc(w.link)}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:16px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">Scegli la password</a>
  </td></tr>
</table>
<div style="margin:28px 0 0;padding:16px 18px;background:${C.bg};border-radius:8px;font-size:14px;line-height:1.6;color:${C.inkSoft};">
  La password deve avere almeno <strong>${w.minLength} caratteri</strong>.<br>
  Il link vale <strong>${w.days} giorni</strong> e si può usare una volta sola. Se scade, chiedi un nuovo link all'amministratore del sito.
</div>
<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${C.inkMute};">Se il pulsante non funziona, copia questo indirizzo nel browser:<br><a href="${esc(w.link)}" style="color:${C.azure};word-break:break-all;">${esc(w.link)}</a></p>`;
  return layout({
    preheader: w.reset ? "Il link per scegliere la password del tuo account." : "Il tuo account è pronto: scegli la password per iniziare.",
    kicker: w.reset ? "Password" : "Account confermato",
    title: w.reset ? "Scegli la tua password" : "Benvenuto sul sito della parrocchia",
    body,
    footer: w.reset
      ? "Hai ricevuto questa email perché l'amministratore del sito ti ha inviato un nuovo link. Se non te lo aspettavi, ignorala: la password attuale resta valida."
      : "Hai ricevuto questa email perché hai chiesto un account sul sito santalfonso.org.",
  });
}
