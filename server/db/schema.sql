-- M5-Tech schema. Safe to re-run: every object is created only if missing.
-- Translatable fields are jsonb shaped {"en": ..., "km": ...}; read them with tr()/tra().

CREATE OR REPLACE FUNCTION tr(j jsonb, lang text) RETURNS text
  LANGUAGE sql IMMUTABLE AS $$ SELECT coalesce(j ->> lang, j ->> 'en') $$;

CREATE OR REPLACE FUNCTION tra(j jsonb, lang text) RETURNS jsonb
  LANGUAGE sql IMMUTABLE AS $$ SELECT coalesce(j -> lang, j -> 'en') $$;

-- ───────────── Site content ─────────────

CREATE TABLE IF NOT EXISTS site_settings (
  key    text PRIMARY KEY,
  value  jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug         text NOT NULL UNIQUE,
  icon         text NOT NULL,
  title        jsonb NOT NULL,
  tagline      jsonb NOT NULL,
  description  jsonb NOT NULL,
  highlights   jsonb NOT NULL,          -- {"en": [...], "km": [...]}
  tech_stack   text[] NOT NULL DEFAULT '{}',
  image        text,                    -- path under client/public, e.g. /images/icon-mobile.jpg
  sort_order   integer NOT NULL DEFAULT 0
);
ALTER TABLE services ADD COLUMN IF NOT EXISTS image text;

CREATE TABLE IF NOT EXISTS industries (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  icon        text NOT NULL,
  name        jsonb NOT NULL,
  short_name  jsonb NOT NULL,
  challenge   jsonb NOT NULL,
  solution    jsonb NOT NULL,
  features    jsonb NOT NULL,           -- {"en": [...], "km": [...]}
  metric      jsonb NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  title         jsonb NOT NULL,
  category      jsonb NOT NULL,
  categories    text[] NOT NULL DEFAULT '{}',   -- filter keys
  badge         jsonb NOT NULL,
  summary       jsonb NOT NULL,
  description   jsonb NOT NULL,
  features      jsonb NOT NULL,
  tech_stack    text[] NOT NULL DEFAULT '{}',
  architecture  jsonb NOT NULL DEFAULT '{}',    -- {"type": "...", "database": "...", ...}
  metrics       jsonb NOT NULL DEFAULT '[]',    -- [{"label": {en,km}, "value": {en,km}}]
  visual        text NOT NULL,
  sort_order    integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS why_points (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug         text NOT NULL UNIQUE,
  icon         text NOT NULL,
  title        jsonb NOT NULL,
  description  jsonb NOT NULL,
  badge        jsonb NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS process_steps (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  step         text NOT NULL UNIQUE,
  icon         text NOT NULL,
  phase        jsonb NOT NULL,
  title        jsonb NOT NULL,
  summary      jsonb NOT NULL,
  details      jsonb NOT NULL,
  deliverable  jsonb NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  question    jsonb NOT NULL,
  answer      jsonb NOT NULL,
  category    jsonb NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

-- ───────────── Hero dashboard preview ─────────────
-- Demo data owned entirely by the seed (db/content/dashboard.json), so these tables
-- are rebuilt on every setup run. Text columns are {"en","km"} jsonb.
DROP TABLE IF EXISTS metric_values, module_metrics, module_movements, dashboard_modules CASCADE;

CREATE TABLE dashboard_modules (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug             text NOT NULL UNIQUE,
  icon             text NOT NULL,
  name             jsonb NOT NULL,
  movements_title  jsonb NOT NULL,
  location_label   jsonb NOT NULL,
  audit_id         text NOT NULL,
  toast_title      jsonb NOT NULL,
  toast_caption    jsonb NOT NULL,
  sort_order       integer NOT NULL DEFAULT 0
);

CREATE TABLE module_metrics (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module_id    integer NOT NULL REFERENCES dashboard_modules(id) ON DELETE CASCADE,
  label        jsonb NOT NULL,
  unit         jsonb,
  unit_accent  boolean NOT NULL DEFAULT false,
  caption      jsonb,
  tone         text NOT NULL CHECK (tone IN ('blue', 'cyan', 'green', 'amber', 'purple')),
  icon         text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX module_metrics_module_idx ON module_metrics (module_id, sort_order);

-- One row per metric per reporting window (7 / 30 / 90 days).
CREATE TABLE metric_values (
  metric_id   integer NOT NULL REFERENCES module_metrics(id) ON DELETE CASCADE,
  range_days  integer NOT NULL CHECK (range_days IN (7, 30, 90)),
  value       text NOT NULL,
  delta_pct   numeric(5,1),
  sparkline   integer[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (metric_id, range_days)
);

CREATE TABLE module_movements (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module_id    integer NOT NULL REFERENCES dashboard_modules(id) ON DELETE CASCADE,
  ref          text NOT NULL,
  item         jsonb NOT NULL,
  location     jsonb NOT NULL,
  quantity     integer NOT NULL,
  unit         jsonb NOT NULL,
  status       text NOT NULL CHECK (status IN ('completed', 'pending', 'flagged')),
  occurred_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX module_movements_recent_idx ON module_movements (module_id, occurred_at DESC);

-- ───────────── Testimonials ─────────────
-- Real client quotes only (db/content/testimonials.json). The section stays hidden while empty.
CREATE TABLE IF NOT EXISTS testimonials (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  author      text NOT NULL,
  role        jsonb NOT NULL,
  company     text NOT NULL,
  quote       jsonb NOT NULL,
  rating      smallint CHECK (rating BETWEEN 1 AND 5),
  project     text,
  avatar      text,
  sort_order  integer NOT NULL DEFAULT 0
);

-- ───────────── Leads ─────────────
-- Submissions from the project request form. Never touched by the seed.
CREATE TABLE IF NOT EXISTS project_inquiries (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name       text NOT NULL,
  company         text,
  email           text NOT NULL,
  phone           text NOT NULL,
  telegram        text,
  project_name    text,
  system_type     text NOT NULL,
  platform        text,
  expected_users  text,
  description     text NOT NULL,
  features        text,
  budget          text,
  timeline        text,
  lang            text NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'km')),
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_inquiries_created_idx ON project_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS project_inquiries_dedupe_idx ON project_inquiries (email, created_at DESC);

-- Defence in depth: the API validates first (shared/inquiry.mjs); these stop bad rows even if
-- something bypasses it. NOT VALID = enforced for new rows without re-checking old ones.
ALTER TABLE project_inquiries DROP CONSTRAINT IF EXISTS project_inquiries_sane;
ALTER TABLE project_inquiries ADD CONSTRAINT project_inquiries_sane CHECK (
      char_length(full_name) BETWEEN 2 AND 120
  AND char_length(email) BETWEEN 6 AND 200 AND position('@' IN email) > 1
  AND char_length(phone) BETWEEN 6 AND 30
  AND char_length(description) BETWEEN 20 AND 5000
  AND char_length(coalesce(features, '')) <= 5000
  AND char_length(coalesce(company, '')) <= 160
  AND char_length(coalesce(project_name, '')) <= 160
  AND char_length(coalesce(telegram, '')) <= 40
  AND system_type IN ('Web Application', 'Mobile Application', 'Desktop Application', 'Management System', 'Other')
) NOT VALID;

-- Per-visitor rate limit that works across serverless instances (Vercel). Stores a salted
-- SHA-256 of the IP, never the IP itself.
ALTER TABLE project_inquiries ADD COLUMN IF NOT EXISTS ip_hash text;
CREATE INDEX IF NOT EXISTS project_inquiries_ip_idx ON project_inquiries (ip_hash, created_at DESC);
