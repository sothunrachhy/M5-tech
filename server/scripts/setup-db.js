// Creates the schema, seeds dashboard demo data + settings, then loads the
// bilingual site content from db/content/*.json. Safe to re-run; leads are kept.
import { readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy server/.env.example to server/.env first.');
  process.exit(1);
}

const dbDir = new URL('../db/', import.meta.url);
const readSql = (f) => readFile(new URL(f, dbDir), 'utf8');
const readJson = async (f) => JSON.parse(await readFile(new URL(`content/${f}`, dbDir), 'utf8'));
const j = (v) => JSON.stringify(v);

// table -> [file, columns, row mapper]
const contentTables = [
  ['services', 'services.json',
    ['slug', 'icon', 'title', 'tagline', 'description', 'highlights', 'tech_stack', 'image'],
    (r) => [r.slug, r.icon, j(r.title), j(r.tagline), j(r.description), j(r.highlights), r.techStack, r.image ?? null]],
  ['industries', 'industries.json',
    ['slug', 'icon', 'name', 'short_name', 'challenge', 'solution', 'features', 'metric'],
    (r) => [r.slug, r.icon, j(r.name), j(r.shortName), j(r.challenge), j(r.solution), j(r.features), j(r.metric)]],
  ['projects', 'projects.json',
    ['slug', 'title', 'category', 'categories', 'badge', 'summary', 'description', 'features',
      'tech_stack', 'architecture', 'metrics', 'visual'],
    (r) => [r.slug, j(r.title), j(r.category), r.categories, j(r.badge), j(r.summary), j(r.description),
      j(r.features), r.techStack, j(r.architecture), j(r.metrics), r.visual]],
  ['why_points', 'why.json',
    ['slug', 'icon', 'title', 'description', 'badge'],
    (r) => [r.slug, r.icon, j(r.title), j(r.description), j(r.badge)]],
  ['process_steps', 'process.json',
    ['step', 'icon', 'phase', 'title', 'summary', 'details', 'deliverable'],
    (r) => [r.step, r.icon, j(r.phase), j(r.title), j(r.summary), j(r.details), j(r.deliverable)]],
  ['faqs', 'faq.json',
    ['slug', 'question', 'answer', 'category'],
    (r) => [r.slug, j(r.question), j(r.answer), j(r.category)]],
  ['testimonials', 'testimonials.json',
    ['slug', 'author', 'role', 'company', 'quote', 'rating', 'project', 'avatar'],
    (r) => [r.slug, r.author, j(r.role), r.company, j(r.quote), r.rating ?? null, r.project ?? null, r.avatar ?? null]],
];

// 7-day series = the last 7 points of the 30-day series; 90-day = a longer, smoother run-up.
function deriveSparkline(range, base) {
  if (range === '7') return base.slice(-7);
  if (range === '90') {
    const lo = Math.min(...base);
    const ramp = [0.55, 0.6, 0.58, 0.66, 0.7, 0.68].map((f) => Math.round(lo * f + lo * 0.2));
    return [...ramp, ...base.filter((_, i) => i % 2 === 1)];
  }
  return base;
}

async function loadDashboard(client) {
  const modules = await readJson('dashboard.json');
  let metricCount = 0;
  for (const [mi, m] of modules.entries()) {
    const {
      rows: [{ id: moduleId }],
    } = await client.query(
      `INSERT INTO dashboard_modules (slug, icon, name, movements_title, location_label, audit_id, toast_title, toast_caption, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [m.slug, m.icon, j(m.name), j(m.movementsTitle), j(m.locationLabel), m.auditId, j(m.toastTitle), j(m.toastCaption), mi + 1],
    );
    for (const [ki, k] of m.metrics.entries()) {
      const {
        rows: [{ id: metricId }],
      } = await client.query(
        `INSERT INTO module_metrics (module_id, label, unit, unit_accent, caption, tone, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [moduleId, j(k.label), k.unit ? j(k.unit) : null, !!k.unitAccent, k.caption ? j(k.caption) : null, k.tone, k.icon, ki + 1],
      );
      const base = k.values['30'].sparkline;
      for (const [range, v] of Object.entries(k.values)) {
        await client.query(
          'INSERT INTO metric_values (metric_id, range_days, value, delta_pct, sparkline) VALUES ($1, $2, $3, $4, $5)',
          [metricId, Number(range), v.value, v.delta ?? null, v.sparkline ?? deriveSparkline(range, base)],
        );
      }
      metricCount++;
    }
    for (const mv of m.movements) {
      await client.query(
        `INSERT INTO module_movements (module_id, ref, item, location, quantity, unit, status, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now() - make_interval(mins => $8))`,
        [moduleId, mv.ref, j(mv.item), j(mv.location), mv.quantity, j(mv.unit), mv.status, mv.minsAgo],
      );
    }
  }
  console.log(`✓ dashboard (${modules.length} modules, ${metricCount} metrics × 3 ranges)`);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query(await readSql('schema.sql'));
  console.log('✓ schema');
  await client.query(await readSql('seed.sql'));
  console.log('✓ settings');

  await client.query('BEGIN');
  await loadDashboard(client);
  await client.query(`TRUNCATE ${contentTables.map(([t]) => t).join(', ')} RESTART IDENTITY`);
  for (const [table, file, cols, map] of contentTables) {
    const rows = await readJson(file);
    const placeholders = [...cols, 'sort_order'].map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${table} (${cols.join(', ')}, sort_order) VALUES (${placeholders})`;
    for (const [i, row] of rows.entries()) await client.query(sql, [...map(row), i + 1]);
    console.log(`✓ ${table} (${rows.length})`);
  }
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
