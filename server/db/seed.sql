-- Site settings. Dashboard demo data now lives in content/dashboard.json.
-- Re-running is safe and never touches project_inquiries.
BEGIN;

INSERT INTO site_settings (key, value) VALUES
  ('contact', '{
     "email": "contact@m5tech.dev",
     "phone": "+855 88 472 8991",
     "telegram": "@m5tech_kh",
     "telegramUrl": "https://t.me/m5tech_kh",
     "facebookUrl": "https://facebook.com/m5tech.kh",
     "location": {"en": "Phnom Penh, Cambodia", "km": "ភ្នំពេញ, កម្ពុជា"}
   }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
