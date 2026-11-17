import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCopy, Lock, Send, X } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { api } from '../lib/api.js';
import {
  firstStepWithError, INQUIRY_FIELDS, INQUIRY_OPTIONS as OPTIONS, INQUIRY_STEPS, validateInquiry,
} from '../../../shared/inquiry.mjs';
import { TelegramIcon } from './ui.jsx';

const EMPTY = {
  fullName: '', company: '', email: '', phone: '', telegram: '',
  projectName: '', systemType: '', platform: '', expectedUsers: '', description: '', features: '',
  budget: '', timeline: '', website: '',
};

const DRAFT_KEY = 'm5-inquiry-draft';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // drafts hold personal details — don't keep them forever

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
    if (!saved?.savedAt || Date.now() - saved.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return EMPTY;
    }
    // only restore known string fields
    const restored = Object.fromEntries(
      Object.keys(INQUIRY_FIELDS).map((k) => [k, typeof saved.data?.[k] === 'string' ? saved.data[k] : '']),
    );
    return { ...EMPTY, ...restored };
  } catch {
    return EMPTY;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
}

function Field({ id, label, hint, required, error, children }) {
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        <span>
          {label}
          {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
        </span>
        <span className="text-xs font-medium text-slate-400">{hint ?? (required ? '' : t.common.optional)}</span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceGroup({ name, label, options, value, onChange, required, error }) {
  const { t, opt } = useI18n();
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="field-label w-full">
        <span>
          {label}
          {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
        </span>
        {!required && <span className="text-xs font-medium text-slate-400">{t.common.optional}</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="peer sr-only" />
            <span className="flex items-center gap-1.5 rounded-full border border-[#d5e3ea] bg-[#f8fbfc] px-4 py-2 text-sm font-semibold text-night-900 transition peer-checked:border-night-900 peer-checked:bg-night-900 peer-checked:text-white peer-checked:[&>svg]:text-aqua-400 peer-focus-visible:ring-4 peer-focus-visible:ring-aqua-400/30 hover:border-aqua-600/60">
              {value === o && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
              {opt(o)}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function buildSummary(form, reference, opt) {
  const line = (label, value, translate = false) => (value ? `${label}: ${translate ? opt(value) : value}` : null);
  return [
    line('Ref', reference),
    line('Name', form.fullName),
    line('Company', form.company),
    line('Email', form.email),
    line('Phone', form.phone),
    line('Telegram', form.telegram),
    line('Project', form.projectName),
    line('System', form.systemType, true),
    line('Platform', form.platform, true),
    line('Users', form.expectedUsers, true),
    line('Budget', form.budget, true),
    line('Timeline', form.timeline, true),
    '',
    form.description,
    form.features ? `\nFeatures:\n${form.features}` : null,
  ]
    .filter((x) => x != null)
    .join('\n');
}

function CopyButton({ text, className = '' }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <ClipboardCopy className="size-4" aria-hidden="true" />}
      {copied ? t.form.copied : t.form.copySummary}
    </button>
  );
}

export default function InquiryForm({ contact, prefill }) {
  const { t, fmt, opt, lang } = useI18n();
  const q = t.inquiry;
  const [form, setForm] = useState(loadDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | error | rate_limited | done
  const [reference, setReference] = useState('');
  const [duplicate, setDuplicate] = useState(false);
  const topRef = useRef(null);

  // autosave draft (never the honeypot), with a timestamp so it expires
  useEffect(() => {
    if (status === 'done') return;
    const id = setTimeout(() => {
      try {
        const { website: _hp, ...data } = form;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), data }));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [form, status]);

  // pre-fill from "Inquire" / "Build similar" buttons
  useEffect(() => {
    if (!prefill) return;
    setForm((f) => ({
      ...f,
      systemType: prefill.systemType ?? f.systemType,
      projectName: prefill.projectName ?? f.projectName,
    }));
    setStatus((s) => (s === 'done' ? 'idle' : s));
  }, [prefill]);

  const set = (name) => (e) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  };

  const errorText = (name) => {
    const key = errors[name];
    if (!key) return null;
    if (key === 'tooLong') return fmt(t.form.errors.tooLong, { max: INQUIRY_FIELDS[name].max });
    return t.form.errors[key] ?? t.form.errors.invalid;
  };

  // Check a field when the user leaves it — but don't nag about empty fields they haven't reached yet.
  const checkOnBlur = (name) => () => {
    if (!String(form[name] ?? '').trim()) return;
    const { errors: e } = validateInquiry(form, [name]);
    setErrors(({ [name]: _, ...rest }) => (e[name] ? { ...rest, [name]: e[name] } : rest));
  };

  const inputProps = (name) => ({
    id: `inq-${name}`,
    name,
    value: form[name],
    onChange: set(name),
    onBlur: checkOnBlur(name),
    maxLength: INQUIRY_FIELDS[name].max,
    'aria-required': INQUIRY_FIELDS[name].required ? 'true' : undefined,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `inq-${name}-error` : undefined,
  });

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const focusField = (name) => setTimeout(() => document.getElementById(`inq-${name}`)?.focus(), 50);

  const showErrors = (e) => {
    setErrors(e);
    const s = firstStepWithError(e);
    if (s >= 0) {
      setStep(s);
      focusField(INQUIRY_STEPS[s].find((f) => e[f]));
    }
  };

  const goNext = () => {
    const { errors: e } = validateInquiry(form, INQUIRY_STEPS[step]);
    if (Object.keys(e).length) return showErrors(e);
    setErrors({});
    setStep((s) => s + 1);
    scrollTop();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (step < INQUIRY_STEPS.length - 1) return goNext();
    const { errors: all } = validateInquiry(form);
    if (Object.keys(all).length) return showErrors(all);

    setStatus('sending');
    try {
      const res = await api.createInquiry({ ...form, lang });
      setReference(res.reference);
      setDuplicate(!!res.duplicate);
      setStatus('done');
      clearDraft();
      scrollTop();
    } catch (err) {
      if (err.status === 400 && err.fields) {
        showErrors(err.fields);
        setStatus('idle');
      } else if (err.status === 429) {
        setStatus('rate_limited');
      } else {
        setStatus('error');
      }
    }
  };

  const reset = () => {
    clearDraft();
    setForm(EMPTY);
    setErrors({});
    setStep(0);
    setStatus('idle');
    setReference('');
    setDuplicate(false);
  };

  const steps = [
    { title: q.sec1Title, sub: q.sec1Subtitle },
    { title: q.sec2Title, sub: q.sec2Subtitle },
    { title: q.sec3Title, sub: q.sec3Subtitle },
  ];

  if (status === 'done') {
    return (
      <div ref={topRef} className="rounded-[26px] bg-white shadow-[0_40px_90px_-30px_rgb(0_0_0/0.65)] ring-1 ring-aqua-400/25 animate-fade-up p-8 text-center sm:p-12" role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-2xl font-bold text-night-900">{t.form.successTitle}</h3>
        <p className="mx-auto mt-3 max-w-md text-slate-ink">{fmt(duplicate ? t.form.duplicateBody : t.form.successBody, { ref: reference })}</p>
        <p className="mx-auto mt-6 inline-block rounded-2xl bg-night-900 px-6 py-3 font-mono text-xl font-bold tracking-wider text-aqua-400 shadow-[0_0_24px_rgb(46_230_214/0.25)]">
          {reference}
        </p>
        <p className="mt-6 text-sm text-slate-ink">{t.form.successTelegram}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {contact.telegramUrl && (
            <a href={contact.telegramUrl} target="_blank" rel="noopener noreferrer" className="btn bg-[#229ED9] text-white hover:bg-[#1b8dc3]">
              <TelegramIcon className="size-4.5" /> {t.contact.openTelegram}
            </a>
          )}
          <CopyButton text={buildSummary(form, reference, opt)} className="btn-outline" />
        </div>
        <button type="button" onClick={reset} className="mt-6 text-sm font-bold text-aqua-700 hover:underline">
          {t.form.another}
        </button>
      </div>
    );
  }

  return (
    <form ref={topRef} onSubmit={submit} noValidate className="rounded-[26px] bg-white shadow-[0_40px_90px_-30px_rgb(0_0_0/0.65)] ring-1 ring-aqua-400/25 overflow-hidden">
      {/* progress header */}
      <div className="border-b border-[#e1edf1] bg-gradient-to-r from-[#eaf7f8] to-white px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 text-xs font-bold">
          <span className="text-aqua-700">{fmt(t.form.stepOf, { n: step + 1, total: 3 })}</span>
          <span className="flex items-center gap-1.5 text-slate-ink">
            <Check className="size-3.5 text-emerald-500" aria-hidden="true" /> {t.form.draftSaved}
          </span>
        </div>
        <ol className="mt-3 grid grid-cols-3 gap-2" aria-label={fmt(t.form.stepOf, { n: step + 1, total: 3 })}>
          {steps.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                className="w-full text-left disabled:cursor-default"
                aria-current={i === step ? 'step' : undefined}
              >
                <span className={`block h-1.5 rounded-full transition ${i <= step ? 'bg-gradient-to-r from-aqua-400 to-aqua-600' : 'bg-[#e1edf1]'}`} />
                <span className={`mt-2 hidden text-xs font-semibold sm:block ${i === step ? 'text-night-900' : 'text-slate-ink'}`}>{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-bold text-night-900">{steps[step].title}</h3>
        <p className="mt-1 text-sm text-slate-ink">{steps[step].sub}</p>

        {form.projectName && step !== 1 && (
          <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-aqua-400/12 py-1.5 pr-1.5 pl-4 text-sm font-semibold text-aqua-700 ring-1 ring-aqua-500/30">
            <span className="truncate">{form.projectName}</span>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, projectName: '' }))}
              aria-label={t.common.close}
              className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-aqua-400/20"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </p>
        )}

        {/* honeypot */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={set('website')} />
        </div>

        <div key={step} className="mt-6 grid animate-fade-up gap-5">
          {step === 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="inq-fullName" label={q.fullNameLabel} required error={errorText('fullName')}>
                  <input {...inputProps('fullName')} className="field" autoComplete="name" placeholder={q.fullNamePlaceholder} />
                </Field>
                <Field id="inq-company" label={q.companyLabel}>
                  <input {...inputProps('company')} className="field" autoComplete="organization" placeholder={q.companyPlaceholder} />
                </Field>
                <Field id="inq-email" label={q.emailLabel} required error={errorText('email')}>
                  <input {...inputProps('email')} type="email" inputMode="email" autoCapitalize="none" spellCheck={false} className="field" autoComplete="email" placeholder={q.emailPlaceholder} />
                </Field>
                <Field id="inq-phone" label={q.phoneLabel} required error={errorText('phone')}>
                  <input {...inputProps('phone')} type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder={q.phonePlaceholder} />
                </Field>
              </div>
              <Field id="inq-telegram" label={q.telegramLabel} hint={q.telegramOptional}>
                <input {...inputProps('telegram')} autoCapitalize="none" spellCheck={false} className="field" placeholder={q.telegramPlaceholder} />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field id="inq-projectName" label={q.projectNameLabel}>
                <input {...inputProps('projectName')} className="field" placeholder={q.projectNamePlaceholder} />
              </Field>
              <ChoiceGroup
                name="systemType"
                label={q.systemTypeLabel}
                options={OPTIONS.systemType}
                value={form.systemType}
                onChange={set('systemType')}
                required
                error={errorText('systemType')}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <ChoiceGroup name="platform" label={q.platformLabel} options={OPTIONS.platform} value={form.platform} onChange={set('platform')} />
                <Field id="inq-expectedUsers" label={q.expectedUsersLabel}>
                  <select {...inputProps('expectedUsers')} className="field">
                    <option value="">—</option>
                    {OPTIONS.expectedUsers.map((o) => (
                      <option key={o} value={o}>
                        {opt(o)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field id="inq-description" label={q.descLabel} required error={errorText('description')}>
                <textarea {...inputProps('description')} rows={4} className="field resize-y" placeholder={q.descPlaceholder} />
                <span className={`mt-1 block text-right text-[11px] ${form.description.trim().length >= 20 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {form.description.trim().length} / 20+
                </span>
              </Field>
              <Field id="inq-features" label={q.featuresLabel}>
                <textarea {...inputProps('features')} rows={3} className="field resize-y" placeholder={q.featuresPlaceholder} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <ChoiceGroup name="budget" label={q.budgetLabel} options={OPTIONS.budget} value={form.budget} onChange={set('budget')} />
              <ChoiceGroup name="timeline" label={q.timelineLabel} options={OPTIONS.timeline} value={form.timeline} onChange={set('timeline')} />
              <p className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-100">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {q.privacyNote}
              </p>
            </>
          )}
        </div>

        {(status === 'error' || status === 'rate_limited') && (
          <div role="alert" className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
            <p>{status === 'rate_limited' ? t.form.rateLimited : t.form.networkError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {contact.telegramUrl && (
                <a href={contact.telegramUrl} target="_blank" rel="noopener noreferrer" className="btn bg-[#229ED9] px-4 py-2 text-white">
                  <TelegramIcon className="size-4" /> {q.sendViaTelegram}
                </a>
              )}
              <CopyButton text={buildSummary(form, '', opt)} className="btn-outline px-4 py-2" />
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e1edf1] pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
              <ArrowLeft className="size-4" aria-hidden="true" /> {t.form.back}
            </button>
          ) : (
            <p className="text-xs text-slate-ink">{t.form.reviewHint}</p>
          )}
          {step < 2 ? (
            <button type="submit" className="btn-aqua">
              {t.form.next} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" disabled={status === 'sending'} className="btn-aqua">
              {status === 'sending' ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-night-ink/30 border-t-night-ink" aria-hidden="true" />
                  {q.submittingBtn}
                </>
              ) : (
                <>
                  <Send className="size-4" aria-hidden="true" /> {q.submitBtn}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
