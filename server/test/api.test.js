// Integration tests against the real app + Postgres (run `npm run db:up` first).
// Rows created here use @test.invalid emails and are deleted afterwards.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { pool } from '../src/db.js';

let server;
let base;
const DOMAIN = '@test.invalid';
const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
const body = (over = {}) => ({
  fullName: 'Test Client',
  email: `t${uniq()}${DOMAIN}`,
  phone: '+855 12 345 678',
  systemType: 'Web Application',
  description: `Integration test request ${uniq()} with enough text.`,
  ...over,
});
const post = (path, payload, raw = false) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ? payload : JSON.stringify(payload),
  });

before(async () => {
  server = createApp({ serveClient: false, inquiryLimit: 1000 }).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await pool.query(`DELETE FROM project_inquiries WHERE email LIKE '%' || $1`, [DOMAIN]);
  await new Promise((r) => server.close(r));
  await pool.end();
});

describe('POST /api/inquiries', () => {
  test('creates a lead and returns a reference', async () => {
    const res = await post('/api/inquiries', body());
    assert.equal(res.status, 201);
    assert.match((await res.json()).reference, /^M5-\d{4}-\d{4,}$/);
  });

  test('same request twice → same reference, one row', async () => {
    const b = body();
    const first = await (await post('/api/inquiries', b)).json();
    const res = await post('/api/inquiries', b);
    const second = await res.json();
    assert.equal(res.status, 200);
    assert.equal(second.duplicate, true);
    assert.equal(second.reference, first.reference);
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM project_inquiries WHERE email = $1', [b.email]);
    assert.equal(rows[0].n, 1);
  });

  test('NUL / control characters are stripped, not a 500', async () => {
    const b = body({ fullName: 'Ab\u0000\u0007‮cd' });
    const res = await post('/api/inquiries', b);
    assert.equal(res.status, 201);
    const { rows } = await pool.query('SELECT full_name FROM project_inquiries WHERE email = $1', [b.email]);
    assert.equal(rows[0].full_name, 'Abcd');
  });

  test('rejects values outside the option lists', async () => {
    const res = await post('/api/inquiries', body({ systemType: '<script>alert(1)</script>', budget: 'lots' }));
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.fields.systemType, 'systemType');
    assert.equal(json.fields.budget, 'budget');
  });

  test('rejects malformed JSON, arrays and huge bodies with clean errors', async () => {
    let res = await post('/api/inquiries', '{"fullName": ', true);
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'invalid_json' });
    res = await post('/api/inquiries', [1, 2, 3]);
    assert.equal(res.status, 400);
    res = await post('/api/inquiries', { description: 'a'.repeat(30_000) });
    assert.equal(res.status, 413);
  });

  test('honeypot submissions are accepted but never stored', async () => {
    const b = body({ website: 'http://spam.example' });
    const res = await post('/api/inquiries', b);
    assert.equal(res.status, 201);
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM project_inquiries WHERE email = $1', [b.email]);
    assert.equal(rows[0].n, 0);
  });
});

describe('rate limiting', () => {
  const send = (url) =>
    fetch(`${url}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body()) }).then((r) => r.status);
  // A fresh salt = a "new visitor", so rows from earlier tests don't count.
  const asNewVisitor = (name) => (process.env.IP_HASH_SALT = `${name}-${uniq()}`);

  test('blocks the 4th submission in the window with 429', async () => {
    asNewVisitor('single');
    const limited = createApp({ serveClient: false, inquiryLimit: 3 }).listen(0);
    const url = `http://127.0.0.1:${limited.address().port}`;
    const codes = [];
    for (let i = 0; i < 4; i++) codes.push(await send(url));
    await new Promise((r) => limited.close(r));
    assert.deepEqual(codes, [201, 201, 201, 429]);
  });

  test('the limit is shared across separate instances (serverless)', async () => {
    asNewVisitor('multi');
    // Two independent app instances = two serverless functions with separate memory.
    const a = createApp({ serveClient: false, inquiryLimit: 3 }).listen(0);
    const b = createApp({ serveClient: false, inquiryLimit: 3 }).listen(0);
    const ua = `http://127.0.0.1:${a.address().port}`;
    const ub = `http://127.0.0.1:${b.address().port}`;
    const codes = [await send(ua), await send(ub), await send(ua), await send(ub)];
    await Promise.all([a, b].map((s) => new Promise((r) => s.close(r))));
    delete process.env.IP_HASH_SALT;
    assert.deepEqual(codes, [201, 201, 201, 429]); // instance b had only seen 2 itself, the DB saw 3
  });
});

describe('security headers & read endpoints', () => {
  test('sends CSP, anti-framing and nosniff headers', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.match(res.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  test('SQL-ish slugs and bad params are handled safely', async () => {
    let res = await fetch(`${base}/api/modules/x'%20OR%201=1--/dashboard`);
    assert.equal(res.status, 404);
    res = await fetch(`${base}/api/modules/medicine-ledger/dashboard?lang=xx&range=9999`);
    const json = await res.json();
    assert.equal(json.range, 30);
    assert.equal(json.module.name, 'Medicine Ledger');
  });

  test('content is served in Khmer', async () => {
    const json = await (await fetch(`${base}/api/content?lang=km`)).json();
    assert.equal(json.lang, 'km');
    assert.ok(json.services.length > 0);
    assert.match(json.contact.location, /[ក-៿]/);
  });
});
