import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pool } from './db.js';
import modulesRouter from './routes/modules.js';
import contentRouter from './routes/content.js';
import inquiriesRouter from './routes/inquiries.js';

/**
 * Builds the Express app without starting it (tests call this directly).
 * Limits can be overridden for tests; defaults suit production.
 */
export function createApp({
  inquiryLimit = Number(process.env.INQUIRY_RATE_LIMIT) || 5, // form submissions per IP per window
  inquiryWindowMs = 15 * 60 * 1000,
  apiLimit = 300, // all API calls per IP per minute
  serveClient = true,
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.locals.inquiryLimit = inquiryLimit; // also enforced per visitor in the database (routes/inquiries.js)

  // Behind nginx / a load balancer set TRUST_PROXY=1 so rate limits see the real client IP.
  // Vercel always sits one proxy hop in front of the function.
  const trustProxy = process.env.TRUST_PROXY ?? (process.env.VERCEL ? '1' : '');
  if (trustProxy) app.set('trust proxy', Number(trustProxy) || trustProxy);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:'],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'none'"],
          'form-action': ["'self'"],
          'object-src': ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  if (process.env.CORS_ORIGIN) {
    app.use('/api', cors({ origin: process.env.CORS_ORIGIN.split(',').map((o) => o.trim()), methods: ['GET', 'POST'] }));
  }

  const limitHandler = (_req, res) => res.status(429).json({ error: 'rate_limited' });
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: apiLimit, standardHeaders: 'draft-7', legacyHeaders: false, handler: limitHandler }));
  const inquiryLimiter = rateLimit({
    windowMs: inquiryWindowMs,
    limit: inquiryLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: limitHandler,
  });

  app.use('/api', express.json({ limit: '20kb', strict: true }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  });
  app.use('/api/modules', modulesRouter);
  app.use('/api/inquiries', inquiryLimiter, inquiriesRouter);
  app.use('/api', contentRouter);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  // In production, serve the built React app from the same origin.
  const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
  if (serveClient && existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h', setHeaders: immutableAssets }));
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  // Express 5 forwards rejected async handlers here. Never leak internals.
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid_json' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'too_large' });
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status < 500 && err.expose ? err.message : 'server_error' });
  });

  return app;
}

// Vite's hashed bundles never change → cache them for a year.
function immutableAssets(res, filePath) {
  if (filePath.includes(`${path.sep}assets${path.sep}`)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
}
