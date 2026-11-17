import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// All page content for one language in a single round-trip.
router.get('/content', async (req, res) => {
  const lang = req.query.lang === 'km' ? 'km' : 'en';
  const q = (sql) => pool.query(sql, [lang]).then((r) => r.rows);

  const [services, industries, projects, why, process, faqs, settings] = await Promise.all([
    q(`SELECT slug, icon, tr(title, $1) AS title, tr(tagline, $1) AS tagline,
              tr(description, $1) AS description, tra(highlights, $1) AS highlights,
              tech_stack AS "techStack", image
         FROM services ORDER BY sort_order`),
    q(`SELECT slug, icon, tr(name, $1) AS name, tr(short_name, $1) AS "shortName",
              tr(challenge, $1) AS challenge, tr(solution, $1) AS solution,
              tra(features, $1) AS features, tr(metric, $1) AS metric
         FROM industries ORDER BY sort_order`),
    q(`SELECT slug, tr(title, $1) AS title, tr(category, $1) AS category, categories,
              tr(badge, $1) AS badge, tr(summary, $1) AS summary, tr(description, $1) AS description,
              tra(features, $1) AS features, tech_stack AS "techStack", architecture, visual,
              coalesce((SELECT jsonb_agg(jsonb_build_object('label', tr(m -> 'label', $1),
                                                            'value', tr(m -> 'value', $1)))
                          FROM jsonb_array_elements(metrics) m), '[]') AS metrics
         FROM projects ORDER BY sort_order`),
    q(`SELECT slug, icon, tr(title, $1) AS title, tr(description, $1) AS description, tr(badge, $1) AS badge
         FROM why_points ORDER BY sort_order`),
    q(`SELECT step, icon, tr(phase, $1) AS phase, tr(title, $1) AS title, tr(summary, $1) AS summary,
              tr(details, $1) AS details, tr(deliverable, $1) AS deliverable
         FROM process_steps ORDER BY sort_order`),
    q(`SELECT slug, tr(question, $1) AS question, tr(answer, $1) AS answer, tr(category, $1) AS category
         FROM faqs ORDER BY sort_order`),
    pool.query(`SELECT value FROM site_settings WHERE key = 'contact'`).then((r) => r.rows),
  ]);
  const testimonials = await q(
    `SELECT slug, author, tr(role, $1) AS role, company, tr(quote, $1) AS quote, rating, project, avatar
       FROM testimonials ORDER BY sort_order`,
  );

  const contact = settings[0]?.value ?? {};
  if (contact.location && typeof contact.location === 'object') {
    contact.location = contact.location[lang] ?? contact.location.en;
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.json({ lang, services, industries, projects, why, process, faqs, testimonials, contact });
});

export default router;
