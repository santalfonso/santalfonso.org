import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { parseReport, UPDATES_SETTING_KEY, type Severity, type Vulnerability } from "@/lib/updates";
import { formatDate, formatDateTime } from "@/lib/utils";
import UpdatesCheckButton from "@/components/admin/UpdatesCheckButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Aggiornamenti" };

const SEVERITY: Record<Severity, string> = {
  critical: "Critica",
  high: "Alta",
  moderate: "Media",
  low: "Bassa",
  info: "Info",
};
const SEVERITY_ORDER: Severity[] = ["critical", "high", "moderate", "low", "info"];

const KIND = {
  major: { label: "Versione principale", hint: "può richiedere modifiche al codice" },
  minor: { label: "Nuove funzioni", hint: "compatibile" },
  patch: { label: "Correzioni", hint: "compatibile" },
} as const;

/** A cosa serve ciascun componente principale, per capire cosa si aggiorna. */
const PURPOSE: Record<string, string> = {
  next: "Motore del sito",
  react: "Interfaccia del sito",
  "react-dom": "Interfaccia del sito",
  "next-auth": "Accesso all'area riservata",
  "@libsql/client": "Collegamento al database",
  "drizzle-orm": "Lettura e scrittura del database",
  cloudinary: "Foto e file su Cloudinary",
  nodemailer: "Invio delle email",
  resend: "Invio delle email",
  "web-push": "Notifiche push",
  "sanitize-html": "Pulizia del testo degli articoli",
  marked: "Formattazione dei testi",
  bcryptjs: "Protezione delle password",
  zod: "Controllo dei dati dei moduli",
  "@vercel/blob": "Archivio file Vercel",
  qrcode: "Codici QR delle scalette",
};

type VulnGroup = { pkg: string; installed: string; dev: boolean; direct: boolean; worst: Severity; firstSeen: string; items: Vulnerability[] };

function groupVulnerabilities(list: Vulnerability[]): VulnGroup[] {
  const map = new Map<string, VulnGroup>();
  for (const v of list) {
    const key = `${v.pkg}@${v.installed}`;
    const g = map.get(key);
    if (!g) {
      map.set(key, { pkg: v.pkg, installed: v.installed, dev: v.dev, direct: v.direct, worst: v.severity, firstSeen: v.firstSeen, items: [v] });
      continue;
    }
    g.items.push(v);
    if (SEVERITY_ORDER.indexOf(v.severity) < SEVERITY_ORDER.indexOf(g.worst)) g.worst = v.severity;
    if (v.firstSeen < g.firstSeen) g.firstSeen = v.firstSeen;
  }
  return [...map.values()].sort(
    (a, b) =>
      Number(a.dev) - Number(b.dev) ||
      SEVERITY_ORDER.indexOf(a.worst) - SEVERITY_ORDER.indexOf(b.worst) ||
      a.pkg.localeCompare(b.pkg),
  );
}

function VulnTable({ groups }: { groups: VulnGroup[] }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table upd-table">
        <thead>
          <tr>
            <th>Componente</th>
            <th>Gravità</th>
            <th>Problemi noti</th>
            <th>Segnalato il</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={`${g.pkg}@${g.installed}`}>
              <td>
                <span className="upd-pkg">{g.pkg}</span> <span className="upd-ver">{g.installed}</span>
                {PURPOSE[g.pkg] && <div className="upd-purpose">{PURPOSE[g.pkg]}</div>}
                {!g.direct && <div className="upd-purpose">Usato da un altro componente</div>}
              </td>
              <td>
                <span className={`upd-sev upd-sev--${g.worst}`}>{SEVERITY[g.worst]}</span>
              </td>
              <td>
                <details className="upd-details">
                  <summary>
                    {g.items.length} {g.items.length === 1 ? "problema" : "problemi"}
                  </summary>
                  <ul>
                    {g.items.map((v) => (
                      <li key={v.id}>
                        <span className={`upd-dot upd-sev--${v.severity}`} aria-label={`Gravità ${SEVERITY[v.severity]}`} />
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="admin-link">
                          {v.title}
                        </a>
                        <span className="upd-range">versioni colpite: {v.range}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </td>
              <td className="mute">{formatDate(g.firstSeen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AggiornamentiPage() {
  const report = parseReport(await getSetting(UPDATES_SETTING_KEY));
  const groups = report ? groupVulnerabilities(report.vulnerabilities) : [];
  const siteVulns = groups.filter((g) => !g.dev);
  const devVulns = groups.filter((g) => g.dev);
  const siteOutdated = report?.outdated.filter((o) => !o.dev) ?? [];
  const devOutdated = report?.outdated.filter((o) => o.dev) ?? [];
  const urgent = siteVulns.filter((g) => g.worst === "critical" || g.worst === "high").length;

  return (
    <div className="upd">
      <div className="admin-card">
        <div className="admin-card-body upd-head">
          <div>
            <h2 className="upd-title">Stato dei componenti del sito</h2>
            <p className="upd-lead">
              Controlla sul registro ufficiale dei pacchetti (npm) le falle di sicurezza note e le nuove versioni dei
              componenti con cui è costruito il sito. Le voci restano in elenco finché l&apos;aggiornamento non viene
              applicato al codice e pubblicato.
            </p>
            <p className="upd-meta">
              {report ? (
                <>
                  Ultima verifica: <strong>{formatDateTime(report.checkedAt)}</strong> · {report.checkedPackages}{" "}
                  componenti controllati
                </>
              ) : (
                "Nessuna verifica eseguita finora."
              )}
            </p>
          </div>
          <UpdatesCheckButton />
        </div>
      </div>

      {report && (
        <>
          {report.errors.length > 0 && (
            <div className="admin-error">{report.errors.join(" ")}</div>
          )}

          <div className="admin-stats-grid upd-stats">
            <div className={`admin-stat-card upd-stat${urgent ? " upd-stat--alert" : ""}`}>
              <div className="admin-stat-num">{siteVulns.length}</div>
              <div className="admin-stat-label">Falle di sicurezza nel sito</div>
              <div className="admin-stat-desc">
                {urgent ? `${urgent} di gravità alta o critica: da aggiornare subito` : siteVulns.length ? "Gravità media o bassa" : "Nessuna falla nota"}
              </div>
            </div>
            <div className="admin-stat-card upd-stat">
              <div className="admin-stat-num">{siteOutdated.length}</div>
              <div className="admin-stat-label">Aggiornamenti del sito</div>
              <div className="admin-stat-desc">Nuove versioni dei componenti principali</div>
            </div>
            <div className="admin-stat-card upd-stat">
              <div className="admin-stat-num">{devVulns.length + devOutdated.length}</div>
              <div className="admin-stat-label">Strumenti di sviluppo</div>
              <div className="admin-stat-desc">Non girano sul sito pubblicato: meno urgenti</div>
            </div>
          </div>

          <section className="upd-section" aria-labelledby="upd-sicurezza">
            <h2 id="upd-sicurezza">Sicurezza</h2>
            {siteVulns.length ? (
              <VulnTable groups={siteVulns} />
            ) : (
              <p className="upd-ok">✓ Nessuna falla di sicurezza nota nei componenti del sito pubblicato.</p>
            )}
          </section>

          <section className="upd-section" aria-labelledby="upd-versioni">
            <h2 id="upd-versioni">Nuove versioni</h2>
            {siteOutdated.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table upd-table">
                  <thead>
                    <tr>
                      <th>Componente</th>
                      <th>Installata</th>
                      <th>Disponibile</th>
                      <th>Tipo</th>
                      <th>Segnalato il</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteOutdated.map((o) => (
                      <tr key={o.pkg}>
                        <td>
                          <a href={`https://www.npmjs.com/package/${o.pkg}`} target="_blank" rel="noopener noreferrer" className="upd-pkg admin-link">
                            {o.pkg}
                          </a>
                          {PURPOSE[o.pkg] && <div className="upd-purpose">{PURPOSE[o.pkg]}</div>}
                        </td>
                        <td className="mute upd-ver">{o.installed}</td>
                        <td className="upd-ver"><strong>{o.latest}</strong></td>
                        <td>
                          <span className={`upd-kind upd-kind--${o.kind}`}>{KIND[o.kind].label}</span>
                          <div className="upd-purpose">{KIND[o.kind].hint}</div>
                        </td>
                        <td className="mute">{formatDate(o.firstSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="upd-ok">✓ Tutti i componenti principali sono all&apos;ultima versione.</p>
            )}
          </section>

          {(devVulns.length > 0 || devOutdated.length > 0) && (
            <details className="upd-section upd-dev">
              <summary>
                <h2>Strumenti di sviluppo</h2>
                <span className="upd-purpose">
                  {devVulns.length} con falle note · {devOutdated.length} con nuove versioni. Servono solo per costruire il
                  sito, non sono raggiungibili dai visitatori.
                </span>
              </summary>
              {devVulns.length > 0 && <VulnTable groups={devVulns} />}
              {devOutdated.length > 0 && (
                <ul className="upd-devlist">
                  {devOutdated.map((o) => (
                    <li key={o.pkg}>
                      <span className="upd-pkg">{o.pkg}</span>{" "}
                      <span className="upd-ver">
                        {o.installed} → {o.latest}
                      </span>{" "}
                      <span className={`upd-kind upd-kind--${o.kind}`}>{KIND[o.kind].label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          )}

          <p className="upd-note">
            Gli aggiornamenti non si installano da qui: vanno applicati al codice del sito, verificati e poi pubblicati.
            Dopo la pubblicazione, una nuova verifica toglie dall&apos;elenco le voci risolte.
          </p>
        </>
      )}
    </div>
  );
}
