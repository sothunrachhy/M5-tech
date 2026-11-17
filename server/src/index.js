import { createApp } from './app.js';
import { pool } from './db.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy server/.env.example to server/.env first.');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 4000;
const server = createApp().listen(PORT, () => console.log(`M5-Tech API listening on http://localhost:${PORT}`));

// Graceful shutdown: finish in-flight requests, then close the DB pool.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down…`);
    server.close(() => pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
