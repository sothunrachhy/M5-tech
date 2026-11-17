import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUp, CalendarDays, Check, CheckCircle2, Clock } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { getIcon } from '../lib/icons.js';
import Sparkline from './Sparkline.jsx';
import { Reveal } from './ui.jsx';

// Design-system colours: Electric Blue, Purple, Gold, Emerald (+ Cyan).
const TONES = {
  blue: { tile: 'bg-[#006bff] shadow-[0_8px_20px_-6px_rgb(0_107_255/0.7)]', line: '#00d4ff', caption: 'text-white/55', badge: null },
  purple: { tile: 'bg-[#7c3aed] shadow-[0_8px_20px_-6px_rgb(124_58_237/0.7)]', line: '#a855f7', caption: 'text-white/55', badge: null },
  amber: { tile: 'bg-[#f59e0b] shadow-[0_8px_20px_-6px_rgb(245_158_11/0.7)]', line: '#f59e0b', caption: 'text-amber-400', badge: Clock },
  green: { tile: 'bg-[#10b981] shadow-[0_8px_20px_-6px_rgb(16_185_129/0.7)]', line: '#10b981', caption: 'text-white/55', badge: CheckCircle2 },
  cyan: { tile: 'bg-[#00b4e6] shadow-[0_8px_20px_-6px_rgb(0_212_255/0.7)]', line: '#00d4ff', caption: 'text-white/55', badge: null },
};

const STATUS = {
  completed: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
  pending: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  flagged: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
};

function timeAgo(iso, lang) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  if (lang === 'km') {
    // Browsers lack Khmer relative-time data, so format it by hand with Khmer digits.
    const kd = (n) => String(n).replace(/\d/g, (c) => '០១២៣៤៥៦៧៨៩'[c]);
    return mins < 60 ? `${kd(mins)} នាទីមុន` : `${kd(Math.round(mins / 60))} ម៉ោងមុន`;
  }
  const rtf = new Intl.RelativeTimeFormat(lang === 'km' ? 'km' : 'en', { numeric: 'auto', style: 'short' });
  return mins < 60 ? rtf.format(-mins, 'minute') : rtf.format(-Math.round(mins / 60), 'hour');
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function MetricCard({ m }) {
  const tone = TONES[m.tone] ?? TONES.blue;
  const Icon = getIcon(m.icon);
  const Badge = tone.badge;
  return (
    <div className="flex flex-col overflow-hidden rounded-[17px] border border-white/12 bg-[linear-gradient(145deg,#18366e,#0d214c)] p-4 xl:p-5">
      <div className="flex items-start gap-3.5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-white ${tone.tile}`}>
          <Icon className="size-5.5" aria-hidden="true" />
        </span>
        {/* @container: the value scales with this column's real width, so it never overflows */}
        <div className="@container min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 text-[14px] leading-snug font-semibold text-white/90">{m.label}</span>
            {Badge && (
              <Badge className={`size-4.5 shrink-0 ${m.tone === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`} aria-hidden="true" />
            )}
          </div>
          <p className="mt-1.5 text-[clamp(1rem,14cqi,1.75rem)] leading-tight font-extrabold whitespace-nowrap text-white">
            {m.value}
            {m.unit && <span className={`ml-[0.3em] text-[0.78em] ${m.unitAccent ? 'text-emerald-400' : 'text-white'}`}>{m.unit}</span>}
          </p>
          <p className="mt-1 h-5 truncate text-[13px] font-semibold">
            {m.deltaPct != null ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <ArrowUp className="size-3.5" aria-hidden="true" />
                {m.deltaPct}%
              </span>
            ) : (
              <span className={`block truncate ${tone.caption}`} title={m.caption}>
                {m.caption}
              </span>
            )}
          </p>
        </div>
      </div>
      {/* sparkline in its own row — no longer drawn over the text */}
      <Sparkline points={m.sparkline} color={tone.line} className="mt-3 h-11 w-full opacity-95" />
    </div>
  );
}

export default function DashboardPreview({ modules, activeSlug, onSelect }) {
  const { t, lang, fmt } = useI18n();
  const d = t.dashboard;
  const list = modules.data ?? [];
  const slug = activeSlug ?? list[0]?.slug ?? null;
  const [range, setRange] = useState(30);
  const dash = useApi(api.dashboard, slug ? `${slug}|${lang}|${range}` : null);
  const data = dash.data;
  const rows = useMemo(() => data?.movements ?? [], [data]);
  const now = useClock();
  const time = new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(now);

  const tabs = list.map((m) => {
    const Icon = getIcon(m.icon);
    const selected = m.slug === slug;
    return { m, Icon, selected };
  });

  return (
    <section id="preview" aria-label={d.eyebrow} className="relative pb-32">
      <div className="container-page">
        <Reveal className="relative">
          {/* success toast */}
          {data && (
            <div className="absolute right-6 -bottom-7 z-20 hidden items-center gap-3 rounded-2xl border border-white/15 bg-ink-900/95 py-3 pr-5 pl-3 shadow-2xl backdrop-blur md:flex">
              <span className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_18px_rgb(16_185_129/0.6)]">
                <Check className="size-5" strokeWidth={3} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">{data.module.toastTitle}</span>
                <span className="block text-xs text-white/65">{data.module.toastCaption}</span>
              </span>
            </div>
          )}

          <div className="relative overflow-hidden rounded-[28px] border border-glow/25 bg-[linear-gradient(145deg,#102b60,#06132f)] shadow-[0_25px_70px_rgb(0_35_100/0.45)] lg:grid lg:grid-cols-[230px_1fr]">
            <div className="bg-grid-dark pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute -top-40 left-1/3 h-80 w-[60%] rounded-full bg-brand-500/20 blur-3xl" />

            {/* sidebar (desktop) / tab strip (mobile) */}
            <aside className="relative border-b border-white/10 p-4 lg:border-r lg:border-b-0 lg:p-5">
              <div className="hidden items-center gap-3 lg:flex">
                <img src="/logo.svg" alt="" className="size-11 rounded-xl" />
                <span className="text-sm leading-tight font-bold text-white">
                  M5 Suite
                  <span className="block font-mono text-[11px] font-normal text-white/45">v2.4.0</span>
                </span>
              </div>
              <p className="mt-7 mb-2 hidden px-3 text-[11px] font-bold tracking-wider text-white/40 uppercase lg:block">{d.modules}</p>
              <div role="tablist" aria-label={d.eyebrow} className="-mx-1 flex gap-2 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
                {tabs.map(({ m, Icon, selected }) => (
                  <button
                    key={m.slug}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => onSelect(m.slug)}
                    className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold whitespace-nowrap transition ${
                      selected
                        ? 'bg-[#006bff] text-white shadow-[0_8px_22px_-6px_rgb(0_107_255/0.8)]'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                    {m.name}
                  </button>
                ))}
              </div>
            </aside>

            <div role="tabpanel" className={`relative min-w-0 p-5 transition-opacity lg:p-7 [&_p]:font-sans [&_td]:font-sans ${dash.loading ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <h3 className="text-xl font-bold text-white">{d.overview}</h3>
                  <span className="hidden h-5 w-px bg-white/15 sm:block" aria-hidden="true" />
                  <span className="flex items-center gap-2 text-[13px] text-white/60">
                    <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" />
                    {d.updated} · {time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1" role="group" aria-label={d.range}>
                  {[7, 30, 90].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={range === n}
                      onClick={() => setRange(n)}
                      className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                        range === n ? 'bg-[#00b4f0] text-white shadow-[0_0_16px_rgb(0_212_255/0.55)]' : 'text-white/65 hover:text-white'
                      }`}
                    >
                      {fmt(d.days, { n })}
                    </button>
                  ))}
                  <CalendarDays className="mx-1.5 size-4 text-white/50" aria-hidden="true" />
                </div>
              </div>

              {!data ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-[17px] border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {data.metrics.map((m) => (
                      <MetricCard key={m.label} m={m} />
                    ))}
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[17px] border border-white/10 bg-[#0d214c]/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
                      <h4 className="flex items-center gap-2.5 text-[15px] font-bold text-white">
                        <Activity className="size-5 text-glow" aria-hidden="true" />
                        {data.module.movementsTitle}
                      </h4>
                      <span className="text-[13px] text-white/60">
                        {d.auditId} : <span className="font-mono text-glow">{data.module.auditId}</span>
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="text-xs tracking-wide text-white/45 uppercase">
                          <tr>
                            <th className="px-5 py-3 font-semibold">{d.ref}</th>
                            <th className="px-5 py-3 font-semibold">{d.item}</th>
                            <th className="hidden px-5 py-3 font-semibold md:table-cell">{data.module.locationLabel}</th>
                            <th className="px-5 py-3 text-right font-semibold">{d.qty}</th>
                            <th className="px-5 py-3 font-semibold">{d.status}</th>
                            <th className="hidden px-5 py-3 text-right font-semibold sm:table-cell">{d.time}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r.ref} className="border-t border-white/5 text-white/85 hover:bg-white/[0.03]">
                              <td className="px-5 py-3 font-mono text-[13px] text-sky-300">{r.ref}</td>
                              <td className="px-5 py-3">{r.item}</td>
                              <td className="hidden px-5 py-3 text-white/65 md:table-cell">{r.location}</td>
                              <td className="px-5 py-3 text-right font-semibold whitespace-nowrap">
                                {r.quantity} <span className="font-normal text-white/50">{r.unit}</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS[r.status]}`}>{d[r.status]}</span>
                              </td>
                              <td className="hidden px-5 py-3 text-right text-white/50 sm:table-cell">{timeAgo(r.occurredAt, lang)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              {(modules.error || dash.error) && !data && (
                <p role="alert" className="mt-4 text-center text-sm text-white/60">
                  {t.common.loadError}{' '}
                  <button type="button" onClick={modules.error ? modules.retry : dash.retry} className="font-bold text-glow underline">
                    {t.common.retry}
                  </button>
                </p>
              )}
            </div>
          </div>
        </Reveal>
          <p className="mt-12 text-center text-sm font-medium text-white/85 [text-shadow:0_1px_8px_rgb(0_40_120/0.6)]">{d.caption}</p>
      </div>
    </section>
  );
}
