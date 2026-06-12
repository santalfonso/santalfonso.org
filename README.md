# Parrocchia Sant'Alfonso Maria de' Liguori — santalfonso.org

Sito vetrina della parrocchia con area di amministrazione per la gestione dei contenuti.

## Stack

- **Next.js 16** (App Router) — frontend pubblico + area admin + API
- **Turso** (libSQL) + **Drizzle ORM** — database
- **Auth.js (next-auth v5)** — autenticazione con ruoli (admin / editor)
- **Cloudinary** — immagini degli articoli
- **Vercel Blob** — file scaricabili delle Risorse (PDF, ecc.)
- **Tailwind CSS 4** — stili
- Deploy su **Vercel**, codice su **GitHub**

## Struttura

| Sezione | Percorso |
|---|---|
| Home (notizie, eventi, orari) | `/` |
| La nostra parrocchia (storia, gruppi, servizi, santo titolare, visite pontefici) | `/parrocchia/...` |
| News | `/news`, `/news/[slug]` |
| Risorse scaricabili | `/risorse` |
| Dove siamo / Contatti | `/dove-siamo`, `/contatti` |
| Area amministrazione | `/admin` (login: `/admin/login`) |

Dall'area admin si gestiscono **articoli** (con immagine di copertina e Markdown), **eventi a calendario** (mostrati in homepage), **risorse scaricabili** e — solo per gli admin — gli **utenti**.

## Sviluppo locale

```bash
npm install
npm run db:push    # crea le tabelle (usa il file local.db se TURSO_DATABASE_URL non è impostata)
npm run db:seed    # crea l'utente admin e i contenuti iniziali
npm run dev
```

Crea un file `.env.local` con almeno `AUTH_SECRET` (genera con `openssl rand -base64 32`). Vedi `.env.example` per tutte le variabili. Senza credenziali Cloudinary/Blob il sito funziona, ma i caricamenti di immagini e file falliranno con un messaggio di errore nel form.

Utente iniziale creato dal seed: `gabrielemichelenapoli@gmail.com` / `cambiami123` — **cambia la password subito** (al momento: crea un nuovo utente admin con password sicura dall'area Utenti, poi elimina quello vecchio).

## Messa in produzione

### 1. GitHub

```bash
git remote add origin git@github.com:TUO-UTENTE/santalfonso.org.git
git push -u origin main
```

### 2. Turso

```bash
turso db create santalfonso
turso db show santalfonso --url        # → TURSO_DATABASE_URL
turso db tokens create santalfonso     # → TURSO_AUTH_TOKEN
```

Poi crea le tabelle e i dati iniziali sul database remoto:

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:push
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx scripts/seed.ts
```

### 3. Cloudinary

Crea un account su [cloudinary.com](https://cloudinary.com) e copia **Cloud name**, **API Key** e **API Secret** dal dashboard.

### 4. Vercel

1. Importa il repository GitHub su [vercel.com](https://vercel.com).
2. In **Storage → Create → Blob** collega un Blob store al progetto: la variabile `BLOB_READ_WRITE_TOKEN` viene aggiunta automaticamente.
3. In **Settings → Environment Variables** aggiungi:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `AUTH_SECRET` (nuovo valore: `openssl rand -base64 32`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Deploy. Ogni push su `main` farà un nuovo deploy automatico.

## Script utili

| Comando | Descrizione |
|---|---|
| `npm run dev` | server di sviluppo |
| `npm run build` / `npm run start` | build e server di produzione |
| `npm run db:push` | applica lo schema al database |
| `npm run db:seed` | dati iniziali (idempotente) |
