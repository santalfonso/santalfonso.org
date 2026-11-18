/**
 * Verifica degli aggiornamenti dei componenti del sito (pacchetti npm).
 * Le versioni installate vengono dal package-lock.json pubblicato con il sito; le versioni
 * nuove e le falle di sicurezza note dal registro ufficiale npm. Solo lato server.
 */
import lockfile from "../../package-lock.json";

type LockEntry = {
  version?: string;
  dev?: boolean;
  link?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
type Lock = { packages: Record<string, LockEntry> };
const lock = lockfile as unknown as Lock;

const REGISTRY = "https://registry.npmjs.org";
const TIMEOUT = 15_000;

export type Severity = "critical" | "high" | "moderate" | "low" | "info";

export type Vulnerability = {
  id: string;
  pkg: string;
  installed: string;
  title: string;
  severity: Severity;
  range: string;
  url: string;
  direct: boolean;
  /** Usato solo per sviluppare il sito, non nel sito pubblicato. */
  dev: boolean;
  firstSeen: string;
};

export type Outdated = {
  pkg: string;
  installed: string;
  latest: string;
  kind: "major" | "minor" | "patch";
  dev: boolean;
  firstSeen: string;
};

export type UpdatesReport = {
  checkedAt: string;
  vulnerabilities: Vulnerability[];
  outdated: Outdated[];
  checkedPackages: number;
  errors: string[];
};

/* ---------- versioni: confronto e intervalli in stile npm (quanto basta per gli avvisi) ---------- */

type Ver = { nums: [number, number, number]; pre: string[] };

function parseVersion(v: string): Ver | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(v.trim());
  if (!m) return null;
  return { nums: [+m[1], +m[2], +m[3]], pre: m[4] ? m[4].split(".") : [] };
}

function compare(a: Ver, b: Ver): number {
  for (let i = 0; i < 3; i++) if (a.nums[i] !== b.nums[i]) return a.nums[i] - b.nums[i];
  if (!a.pre.length || !b.pre.length) return (a.pre.length ? -1 : 0) - (b.pre.length ? -1 : 0);
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i];
    const y = b.pre[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const nx = /^\d+$/.test(x);
    const ny = /^\d+$/.test(y);
    if (nx && ny && +x !== +y) return +x - +y;
    if (nx !== ny) return nx ? -1 : 1;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/** Una versione rientra in un intervallo come ">=16.0.0 <16.4.4 || <15.5.7"? */
export function satisfies(version: string, range: string): boolean {
  const v = parseVersion(version);
  if (!v) return false;
  return range.split("||").some((part) => {
    const comparators = part.trim().replace(/([<>=]+)\s+/g, "$1").split(/\s+/).filter(Boolean);
    if (!comparators.length || comparators.includes("*")) return true;
    return comparators.every((c) => {
      const m = /^(<=|>=|<|>|=)?(.+)$/.exec(c);
      const target = m && parseVersion(m[2]);
      if (!target) return false;
      const d = compare(v, target);
      switch (m[1]) {
        case "<": return d < 0;
        case "<=": return d <= 0;
        case ">": return d > 0;
        case ">=": return d >= 0;
        default: return d === 0;
      }
    });
  });
}

/* ---------- versioni installate ---------- */

function installed() {
  const all = new Map<string, Set<string>>();
  // name@version usati anche nel sito pubblicato (non solo in sviluppo)
  const runtime = new Set<string>();
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!path || entry.link || !entry.version) continue;
    const name = path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
    if (!all.has(name)) all.set(name, new Set());
    all.get(name)!.add(entry.version);
    if (!entry.dev) runtime.add(`${name}@${entry.version}`);
  }
  const root = lock.packages[""] ?? {};
  const direct = [
    ...Object.keys(root.dependencies ?? {}).map((name) => ({ name, dev: false })),
    ...Object.keys(root.devDependencies ?? {}).map((name) => ({ name, dev: true })),
  ].map((d) => ({ ...d, version: lock.packages[`node_modules/${d.name}`]?.version ?? "" }));
  return { all, direct, runtime };
}

const SEVERITY_ORDER: Severity[] = ["critical", "high", "moderate", "low", "info"];

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { accept: "application/json", "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Esegue la verifica. `previous` è il risultato precedente: le voci già note mantengono
 * la data in cui sono state segnalate la prima volta.
 */
export async function checkUpdates(previous?: UpdatesReport | null): Promise<UpdatesReport> {
  const now = new Date().toISOString();
  const errors: string[] = [];
  const { all, direct, runtime } = installed();
  const directNames = new Set(direct.map((d) => d.name));

  const seenVuln = new Map(previous?.vulnerabilities.map((v) => [`${v.id}|${v.pkg}|${v.installed}`, v.firstSeen]) ?? []);
  const seenOld = new Map(previous?.outdated.map((o) => [`${o.pkg}|${o.latest}`, o.firstSeen]) ?? []);

  // 1. falle di sicurezza note (lo stesso servizio usato da "npm audit")
  const vulnerabilities: Vulnerability[] = [];
  try {
    const body = Object.fromEntries([...all].map(([name, versions]) => [name, [...versions]]));
    const advisories = (await fetchJson(`${REGISTRY}/-/npm/v1/security/advisories/bulk`, {
      method: "POST",
      body: JSON.stringify(body),
    })) as Record<string, { id: number | string; title: string; severity: Severity; vulnerable_versions: string; url: string }[]>;
    for (const [pkg, list] of Object.entries(advisories)) {
      for (const a of list) {
        for (const version of all.get(pkg) ?? []) {
          if (!satisfies(version, a.vulnerable_versions)) continue;
          const key = `${a.id}|${pkg}|${version}`;
          vulnerabilities.push({
            id: String(a.id),
            pkg,
            installed: version,
            title: a.title,
            severity: SEVERITY_ORDER.includes(a.severity) ? a.severity : "info",
            range: a.vulnerable_versions,
            url: a.url,
            direct: directNames.has(pkg),
            dev: !runtime.has(`${pkg}@${version}`),
            firstSeen: seenVuln.get(key) ?? now,
          });
        }
      }
    }
    vulnerabilities.sort(
      (a, b) =>
        Number(a.dev) - Number(b.dev) ||
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
        a.pkg.localeCompare(b.pkg),
    );
  } catch (e) {
    errors.push(`Controllo di sicurezza non riuscito (${e instanceof Error ? e.message : "errore"}).`);
  }

  // 2. versioni nuove dei componenti principali
  const outdated: Outdated[] = [];
  const results = await Promise.allSettled(
    direct.map(async (d) => {
      const data = (await fetchJson(`${REGISTRY}/${d.name.replace("/", "%2F")}/latest`)) as { version: string };
      return { ...d, latest: data.version };
    }),
  );
  let failed = 0;
  for (const r of results) {
    if (r.status === "rejected") {
      failed++;
      continue;
    }
    const cur = parseVersion(r.value.version);
    const lat = parseVersion(r.value.latest);
    if (!cur || !lat || compare(lat, cur) <= 0) continue;
    // per i pacchetti 0.x anche un cambio di minor può richiedere modifiche al codice
    const kind =
      lat.nums[0] !== cur.nums[0] || (cur.nums[0] === 0 && lat.nums[1] !== cur.nums[1])
        ? "major"
        : lat.nums[1] !== cur.nums[1]
          ? "minor"
          : "patch";
    outdated.push({
      pkg: r.value.name,
      installed: r.value.version,
      latest: r.value.latest,
      kind,
      dev: r.value.dev,
      firstSeen: seenOld.get(`${r.value.name}|${r.value.latest}`) ?? now,
    });
  }
  if (failed) errors.push(`Non è stato possibile controllare ${failed} componenti.`);
  const KIND = { major: 0, minor: 1, patch: 2 };
  outdated.sort((a, b) => Number(a.dev) - Number(b.dev) || KIND[a.kind] - KIND[b.kind] || a.pkg.localeCompare(b.pkg));

  return { checkedAt: now, vulnerabilities, outdated, checkedPackages: all.size, errors };
}

export const UPDATES_SETTING_KEY = "updates_report";

export function parseReport(value: string | null): UpdatesReport | null {
  if (!value) return null;
  try {
    const r = JSON.parse(value) as UpdatesReport;
    return Array.isArray(r.vulnerabilities) && Array.isArray(r.outdated) ? r : null;
  } catch {
    return null;
  }
}
