import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const RANGES = new Set([7, 30, 90]);
const langOf = (req) => (req.query.lang === 'km' ? 'km' : 'en');

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT slug, icon, tr(name, $1) AS name FROM dashboard_modules ORDER BY sort_order, id',
    [langOf(req)],
  );
  res.json(rows);
});

// GET /api/modules/:slug/dashboard?lang=en|km&range=7|30|90
router.get('/:slug/dashboard', async (req, res) => {
  const lang = langOf(req);
  const range = RANGES.has(Number(req.query.range)) ? Number(req.query.range) : 30;

  const {
    rows: [module],
  } = await pool.query(
    `SELECT id, slug, icon, tr(name, $2) AS name,
            tr(movements_title, $2) AS "movementsTitle",
            tr(location_label, $2)  AS "locationLabel",
            audit_id                AS "auditId",
            tr(toast_title, $2)     AS "toastTitle",
            tr(toast_caption, $2)   AS "toastCaption"
       FROM dashboard_modules
      WHERE slug = $1`,
    [req.params.slug, lang],
  );
  if (!module) return res.status(404).json({ error: 'Module not found' });

  const [metrics, movements] = await Promise.all([
    pool.query(
      `SELECT tr(m.label, $2) AS label, v.value, tr(m.unit, $2) AS unit, m.unit_accent AS "unitAccent",
              v.delta_pct AS "deltaPct", tr(m.caption, $2) AS caption, m.tone, m.icon, v.sparkline
         FROM module_metrics m
         JOIN metric_values v ON v.metric_id = m.id AND v.range_days = $3
        WHERE m.module_id = $1
        ORDER BY m.sort_order, m.id`,
      [module.id, lang, range],
    ),
    pool.query(
      `SELECT ref, tr(item, $2) AS item, tr(location, $2) AS location, quantity, tr(unit, $2) AS unit,
              status, occurred_at AS "occurredAt"
         FROM module_movements
        WHERE module_id = $1
        ORDER BY occurred_at DESC
        LIMIT 6`,
      [module.id, lang],
    ),
  ]);

  const { id, ...publicModule } = module;
  res.json({ module: publicModule, range, metrics: metrics.rows, movements: movements.rows });
});

export default router;
