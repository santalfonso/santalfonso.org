import type { Metadata } from "next";
import { v2 as cloudinary } from "cloudinary";
import { count } from "drizzle-orm";
import { requireOwnerPage } from "@/auth";
import { db } from "@/db";
import { articles, events, pushSubscriptions, resources, users } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consumi" };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryUsage = {
  plan: string;
  credits: { usage: number; limit: number; used_percent: number };
  storage: { usage: number };
  bandwidth: { usage: number };
  transformations: { usage: number };
  resources: number;
};

const mb = (bytes: number) => `${(bytes / 1048576).toLocaleString("it-IT", { maximumFractionDigits: 0 })} MB`;

/** Consumi dei servizi esterni: Cloudinary letto dalle sue API, per gli altri i collegamenti alle dashboard. */
export default async function ConsumiPage() {
  await requireOwnerPage();

  let usage: CloudinaryUsage | null = null;
  let usageError: string | null = null;
  try {
    usage = (await cloudinary.api.usage()) as CloudinaryUsage;
  } catch (e) {
    usageError = e instanceof Error ? e.message : "risposta non valida";
  }

  const [[a], [e], [r], [u], [p]] = await Promise.all([
    db.select({ n: count() }).from(articles),
    db.select({ n: count() }).from(events),
    db.select({ n: count() }).from(resources),
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(pushSubscriptions),
  ]);

  const pct = usage ? Math.min(100, usage.credits.used_percent) : 0;
  const barColor = pct >= 80 ? "#B91C1C" : pct >= 50 ? "#B45309" : "var(--azure-deep)";

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="admin-card">
        <div className="admin-card-body">
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Cloudinary — immagini e documenti</h2>
          {usage ? (
            <>
              <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "0 0 16px" }}>
                Piano {usage.plan}: {usage.credits.limit} crediti al mese (1 credito ≈ 1 GB di spazio o di traffico, oppure
                1.000 trasformazioni). Dati aggiornati da Cloudinary più volte al giorno.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                <span>Crediti usati</span>
                <span>
                  {usage.credits.usage.toLocaleString("it-IT", { maximumFractionDigits: 2 })} / {usage.credits.limit} (
                  {pct.toLocaleString("it-IT", { maximumFractionDigits: 1 })}%)
                </span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "var(--bg-soft)", overflow: "hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${Math.max(pct, 1)}%`, height: "100%", background: barColor }} />
              </div>
              <div className="admin-grid-2" style={{ marginTop: 20 }}>
                {[
                  ["Spazio occupato", mb(usage.storage.usage)],
                  ["Traffico del mese", mb(usage.bandwidth.usage)],
                  ["Trasformazioni del mese", usage.transformations.usage.toLocaleString("it-IT")],
                  ["File salvati", usage.resources.toLocaleString("it-IT")],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: "12px 14px", background: "var(--bg-soft)", borderRadius: "var(--r-sm)" }}>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-error">Consumi di Cloudinary non disponibili: {usageError}</div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Database (Turso)</h2>
          <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "0 0 16px" }}>
            Contenuti salvati. Il piano gratuito di Turso consente miliardi di letture al mese: il sito ne usa una minima parte.
          </p>
          <div className="admin-grid-2">
            {[
              ["Articoli", a.n],
              ["Eventi", e.n],
              ["Risorse", r.n],
              ["Utenti", u.n],
              ["Dispositivi iscritti alle notifiche", p.n],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "12px 14px", background: "var(--bg-soft)", borderRadius: "var(--r-sm)" }}>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{Number(value).toLocaleString("it-IT")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Altri servizi</h2>
          <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "0 0 12px" }}>
            Questi servizi non mostrano i consumi a siti esterni: si controllano dalle loro dashboard.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9 }}>
            <li>
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="admin-link">Vercel</a> — hosting del sito: progetto → Usage (piano Hobby, circa 100 GB di traffico al mese)
            </li>
            <li>
              <a href="https://app.turso.tech" target="_blank" rel="noopener noreferrer" className="admin-link">Turso</a> — database: letture, scritture e spazio
            </li>
            <li>
              <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="admin-link">Resend</a> — email del form contatti (3.000 al mese, 100 al giorno)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
