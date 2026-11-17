# M5-Tech website

Bilingual (English / ខ្មែរ) marketing site for M5-Tech.

- **Frontend:** React 19 + Vite + Tailwind CSS v4 (`client/`)
- **API:** Node.js + Express 5 (`server/`) — runs as a Vercel serverless function in production (`api/`)
- **Database:** PostgreSQL (Docker locally, Neon/Supabase in production)

## Project structure

```
api/index.js          Vercel serverless entry → wraps the Express app (server/src/app.js)
client/               React site (Vite)
  public/images/      artwork and 3D icons
  src/components/     one file per page section
  src/i18n/           UI strings: en.json, km.json, extra.js
  src/lib/features.js on/off switches for sections (portfolio, dashboard preview)
server/
  src/app.js          Express app: security headers, rate limits, routes, errors
  src/index.js        local server (npm run dev / npm start)
  src/routes/         content, modules (dashboard), inquiries (contact form)
  db/schema.sql       tables + constraints (safe to re-run)
  db/seed.sql         contact details (email, phone, Telegram…)
  db/content/*.json   all page content, English + Khmer
  scripts/setup-db.js creates tables and loads content
  test/               automated tests
shared/inquiry.mjs    contact-form rules used by BOTH the browser and the API
vercel.json           Vercel build, routing and security headers
docker-compose.yml    local Postgres
```

## Run locally

```bash
npm install
npm run db:up        # Postgres in Docker on localhost:5442
npm run db:setup     # create tables + load content
npm run dev          # API :4000, website :5173 (next free port if taken)
npm test             # 23 tests (needs the database running)
```

## Deploy to Vercel

The site is served from Vercel's CDN; every `/api/*` request goes to one serverless function
(`api/index.js`). The database must be a **hosted** Postgres — Docker only exists on your computer.

### 1. Put the code on GitHub
```bash
git init
git add .
git commit -m "M5-Tech website"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/m5-tech.git
git push -u origin main
```
`.gitignore` already keeps `node_modules`, `dist` and every `.env` file out of the repo.

### 2. Create the project on Vercel
vercel.com → **Add New → Project** → import the GitHub repo. Leave **Root Directory** as the repo root.
Build settings come from `vercel.json` — don't override them.

### 3. Add a database
Vercel project → **Storage → Create → Neon (Postgres)** → connect it to the project.
This adds `DATABASE_URL` to the project automatically. (Supabase or any Postgres works too —
paste its **pooled** connection string, with `?sslmode=require`, as `DATABASE_URL`.)

### 4. Environment variables
Vercel project → **Settings → Environment Variables**:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | set by Neon in step 3 (or your own pooled URL) |
| `IP_HASH_SALT` | any long random string (used to hash visitor IPs for the form limit) |
| `INQUIRY_RATE_LIMIT` | optional, default `5` form submissions per visitor per 15 min |

### 5. Load the tables and content into the hosted database (once)
Copy the database URL from Vercel (Storage → your database → `.env.local` tab), then on your computer:

```powershell
# PowerShell
$env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
npm run db:setup
Remove-Item Env:DATABASE_URL
```
Run it again whenever you change `server/db/content/*.json` or `seed.sql`. Form submissions are never touched.

### 6. Deploy
Push to `main` → Vercel builds and deploys automatically. Check `https://<your-project>.vercel.app/api/health`
returns `{"ok":true}`.

## Editing content

| What | Where |
| --- | --- |
| Services, industries, why-us, process, FAQ (EN + KM) | `server/db/content/*.json`, then `npm run db:setup` |
| Contact details | `server/db/seed.sql` (`site_settings`), then `npm run db:setup` |
| Testimonials (hidden while empty) | `server/db/content/testimonials.json` — shape in `testimonials.example.json` |
| Portfolio / dashboard preview (both off) | turn on in `client/src/lib/features.js`; content in `projects.json` / `dashboard.json` |
| Buttons, headings, form labels | `client/src/i18n/en.json`, `km.json`, `extra.js` |

**Reading form submissions** — they're stored in the `project_inquiries` table. Locally:
```bash
docker exec -it m5tech-db psql -U m5tech -d m5tech -c "SELECT id, created_at, full_name, email, phone, system_type, budget FROM project_inquiries ORDER BY id DESC;"
```
On Neon, use its **SQL Editor** with the same `SELECT`.

## Security

- **Contact form:** one shared rule set (`shared/inquiry.mjs`) in browser + API; database constraints as a backstop;
  duplicate submissions return the original reference; honeypot for bots.
- **Rate limit** stored in the database, so it holds across Vercel's many serverless instances
  (visitor IPs are stored only as salted hashes).
- **Headers:** Content-Security-Policy (own site + Google Fonts only), no framing, nosniff, strict referrer —
  set by `vercel.json` for pages and by helmet for the API.
- Errors never expose stack traces or SQL. Local Postgres listens on `127.0.0.1` only.

## API

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | Database check |
| GET | `/api/content?lang=en\|km` | All page content |
| GET | `/api/modules…` | Dashboard preview data (only used when the preview is switched on) |
| POST | `/api/inquiries` | Saves a project request, returns a reference like `M5-2611-0001` |
