import { createHash } from 'node:crypto';
import { Router } from 'express';
import { validateInquiry } from '../../../shared/inquiry.mjs';
import { pool } from '../db.js';

const router = Router();
const DUPLICATE_WINDOW_HOURS = 24;
const DEFAULT_IP_LIMIT = Number(process.env.INQUIRY_RATE_LIMIT) || 5; // new requests per visitor per window
const IP_WINDOW_MINUTES = 15;
const ipHash = (ip) =>
  createHash('sha256').update(`${process.env.IP_HASH_SALT ?? 'm5-tech'}:${ip ?? ''}`).digest('hex').slice(0, 32);

router.post('/', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  // Honeypot: a hidden field only bots fill in. Pretend success so they don't adapt.
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(201).json({ ok: true, reference: 'M5-0000' });
  }

  const { data: d, errors } = validateInquiry(body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'validation', fields: errors });
  const lang = body.lang === 'km' ? 'km' : 'en';
  const visitor = ipHash(req.ip);

  // Same person re-sending the same request (double click, refresh, retry) → return the original
  // reference instead of creating a duplicate lead.
  const {
    rows: [existing],
  } = await pool.query(
    `SELECT 'M5-' || to_char(created_at, 'YYMM') || '-' || lpad(id::text, 4, '0') AS reference,
            created_at AS "createdAt"
       FROM project_inquiries
      WHERE email = $1 AND description = $2 AND created_at > now() - make_interval(hours => $3)
      ORDER BY id DESC
      LIMIT 1`,
    [d.email, d.description, DUPLICATE_WINDOW_HOURS],
  );
  if (existing) return res.status(200).json({ ok: true, duplicate: true, ...existing });

  // Shared limit (all serverless instances see the same table).
  const {
    rows: [recent],
  } = await pool.query(
    'SELECT count(*)::int AS n FROM project_inquiries WHERE ip_hash = $1 AND created_at > now() - make_interval(mins => $2)',
    [visitor, IP_WINDOW_MINUTES],
  );
  if (recent.n >= (req.app.locals.inquiryLimit ?? DEFAULT_IP_LIMIT)) return res.status(429).json({ error: 'rate_limited' });

  const {
    rows: [row],
  } = await pool.query(
    `INSERT INTO project_inquiries
       (full_name, company, email, phone, telegram, project_name, system_type, platform,
        expected_users, description, features, budget, timeline, lang, ip_hash)
     VALUES ($1, NULLIF($2, ''), $3, $4, NULLIF($5, ''), NULLIF($6, ''), $7, NULLIF($8, ''),
             NULLIF($9, ''), $10, NULLIF($11, ''), NULLIF($12, ''), NULLIF($13, ''), $14, $15)
     RETURNING 'M5-' || to_char(created_at, 'YYMM') || '-' || lpad(id::text, 4, '0') AS reference,
               created_at AS "createdAt"`,
    [d.fullName, d.company, d.email, d.phone, d.telegram, d.projectName, d.systemType, d.platform,
      d.expectedUsers, d.description, d.features, d.budget, d.timeline, lang, visitor],
  );
  res.status(201).json({ ok: true, ...row });
});

export default router;
