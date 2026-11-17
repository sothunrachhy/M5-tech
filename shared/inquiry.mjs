// Project-request validation shared by the browser (client/) and the API (server/).
// One source of truth: the form and the server can never disagree about what is valid.
// Error values are i18n keys looked up in client/src/i18n/extra.js → form.errors.

export const INQUIRY_OPTIONS = Object.freeze({
  systemType: ['Web Application', 'Mobile Application', 'Desktop Application', 'Management System', 'Other'],
  platform: ['Web', 'Android', 'iOS', 'Web + Mobile', 'Not Sure'],
  expectedUsers: [
    '1–10 Users (Internal Team)',
    '10–50 Users (Small Org)',
    '50–200 Users (Medium Enterprise)',
    '200–1,000+ Users (Large Facility)',
    'Public Facing (Unlimited)',
  ],
  budget: ['Below $300', '$300 – $500', '$500 – $1,000', '$1,000 – $3,000', '$3,000 – $5,000', 'Above $5,000', 'Need Consultation'],
  timeline: ['Within 1 Month', '1–3 Months', '3–6 Months', 'Flexible'],
});

/**
 * Field rules. kind: text (one line), multiline, email, phone, telegram, choice.
 * Required fields are the minimum an engineer needs to reply.
 */
export const INQUIRY_FIELDS = Object.freeze({
  fullName: { kind: 'text', required: true, min: 2, max: 120 },
  company: { kind: 'text', max: 160 },
  email: { kind: 'email', required: true, max: 200 },
  phone: { kind: 'phone', required: true, max: 30 },
  telegram: { kind: 'telegram', max: 40 },
  projectName: { kind: 'text', max: 160 },
  systemType: { kind: 'choice', required: true },
  platform: { kind: 'choice' },
  expectedUsers: { kind: 'choice' },
  description: { kind: 'multiline', required: true, min: 20, max: 5000 },
  features: { kind: 'multiline', max: 5000 },
  budget: { kind: 'choice' },
  timeline: { kind: 'choice' },
});

/** Fields shown on each step of the 3-step form. */
export const INQUIRY_STEPS = [
  ['fullName', 'company', 'email', 'phone', 'telegram'],
  ['projectName', 'systemType', 'platform', 'expectedUsers', 'description', 'features'],
  ['budget', 'timeline'],
];

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]+$/;
const TELEGRAM_RE = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/;
// C0/C1 control chars (keeping tab/newline for multiline), DEL, and bidi overrides that can disguise text.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F‪-‮⁦-⁩]/g;

/** Normalises user text: Unicode NFC, strips control/bidi chars, trims; one-line fields collapse whitespace. */
export function cleanText(value, multiline = false) {
  if (typeof value !== 'string') return '';
  let s = value.normalize('NFC').replace(CONTROL_RE, '');
  s = multiline ? s.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{4,}/g, '\n\n\n') : s.replace(/\s+/g, ' ');
  return s.trim();
}

function checkField(name, raw) {
  const rule = INQUIRY_FIELDS[name];
  if (raw != null && typeof raw !== 'string') return { error: 'invalid' };
  const value = cleanText(raw ?? '', rule.kind === 'multiline');

  if (!value) return rule.required ? { value, error: name } : { value };
  if (rule.max && value.length > rule.max) return { value, error: 'tooLong' };
  if (rule.min && value.length < rule.min) return { value, error: name };

  switch (rule.kind) {
    case 'text':
      if (name === 'fullName' && !/\p{L}/u.test(value)) return { value, error: name };
      break;
    case 'email':
      if (!EMAIL_RE.test(value)) return { value, error: name };
      return { value: value.toLowerCase() };
    case 'phone': {
      const digits = value.replace(/\D/g, '').length;
      if (!PHONE_RE.test(value) || digits < 8 || digits > 15) return { value, error: name };
      break;
    }
    case 'telegram': {
      const asPhone = PHONE_RE.test(value) && value.replace(/\D/g, '').length >= 8;
      if (!asPhone && !TELEGRAM_RE.test(value)) return { value, error: name };
      break;
    }
    case 'choice':
      if (!INQUIRY_OPTIONS[name].includes(value)) return { value, error: name };
      break;
  }
  return { value };
}

/**
 * Validates `input` (only the listed `fields`, default: all).
 * Returns { data, errors } — `errors` maps field → i18n key and is empty when valid.
 * Unknown keys are ignored, never stored.
 */
export function validateInquiry(input, fields = Object.keys(INQUIRY_FIELDS)) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const data = {};
  const errors = {};
  for (const name of fields) {
    const { value, error } = checkField(name, source[name]);
    data[name] = value ?? '';
    if (error) errors[name] = error;
  }
  return { data, errors };
}

/** Index of the first form step containing an error, or -1. */
export function firstStepWithError(errors) {
  return INQUIRY_STEPS.findIndex((fields) => fields.some((f) => errors[f]));
}
