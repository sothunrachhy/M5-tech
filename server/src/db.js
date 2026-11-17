import pg from 'pg';

// Return NUMERIC columns as JS numbers instead of strings.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => (v === null ? null : Number(v)));

const onVercel = !!process.env.VERCEL;

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Serverless functions run many small instances: keep each one's pool tiny and let
  // idle connections close quickly. Use the provider's *pooled* connection string on Vercel.
  max: Number(process.env.PG_POOL_MAX) || (onVercel ? 3 : 10),
  idleTimeoutMillis: onVercel ? 5_000 : 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => console.error('Idle Postgres client error:', err.message));
