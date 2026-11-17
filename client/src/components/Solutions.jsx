import { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Lightbulb, TrendingUp } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { getIcon } from '../lib/icons.js';
import { Reveal, SectionState, SectionTitle } from './ui.jsx';

export default function Solutions({ items, loading, error, retry, onRequest }) {
  const { t } = useI18n();
  const s = t.solutions;
  const [activeSlug, setActiveSlug] = useState(null);
  const active = items?.find((i) => i.slug === activeSlug) ?? items?.[0];

  const onKeyDown = (e) => {
    if (!items || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const idx = items.indexOf(active);
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = items[(idx + step + items.length) % items.length];
    setActiveSlug(next.slug);
    document.getElementById(`tab-${next.slug}`)?.focus();
  };

  return (
    <section id="solutions" aria-labelledby="solutions-title" className="relative py-10 lg:py-14">
      <div className="container-page">
        {/* see-through framed panel: the moving night background shows through */}
        <div className="relative isolate overflow-hidden rounded-[32px] border border-aqua-400/15 bg-[linear-gradient(180deg,rgb(11_36_56/0.55),rgb(5_19_31/0.35))] px-4 py-14 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.8)] sm:px-8 lg:rounded-[40px] lg:px-12 lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="angkor-silhouette absolute right-[4%] bottom-0 hidden h-56 w-[30rem] bg-aqua-400/[0.06] lg:block" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aqua-400/50 to-transparent" />
          </div>

          <SectionTitle id="solutions-title" tone="dark" badge={s.badge} headline={s.headline} lead={s.subheadline} />

          <div className="mt-14">
            <SectionState loading={loading} error={error} retry={retry} skeleton={1} />
            {active && (
              <div className="grid gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[330px_1fr]">
                {/* sector tabs: horizontal scroll on mobile, vertical list on desktop */}
                <div
                  role="tablist"
                  aria-orientation="vertical"
                  aria-label={s.badge}
                  onKeyDown={onKeyDown}
                  className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
                >
                  {items.map((item) => {
                    const Icon = getIcon(item.icon);
                    const selected = item === active;
                    return (
                      <button
                        key={item.slug}
                        id={`tab-${item.slug}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls="solution-panel"
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActiveSlug(item.slug)}
                        className={`flex shrink-0 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition lg:py-3.5 ${
                          selected
                            ? 'border-aqua-400/70 bg-aqua-400/10 text-white shadow-[0_0_24px_rgb(46_230_214/0.18),inset_0_0_0_1px_rgb(46_230_214/0.15)]'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-aqua-400/35 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${
                            selected ? 'bg-gradient-to-b from-[#5cf5e8] to-aqua-500 text-night-ink' : 'bg-white/[0.06] text-aqua-400'
                          }`}
                        >
                          <Icon className="size-[18px]" aria-hidden="true" />
                        </span>
                        <span className="whitespace-nowrap lg:whitespace-normal">{item.shortName}</span>
                        <ChevronRight
                          className={`ml-auto hidden size-4 shrink-0 transition lg:block ${selected ? 'translate-x-0 text-aqua-400' : '-translate-x-1 opacity-0'}`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>

                <Reveal
                  key={active.slug}
                  id="solution-panel"
                  role="tabpanel"
                  aria-labelledby={`tab-${active.slug}`}
                  className="card-night overflow-hidden rounded-[26px]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-6 sm:px-8">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const Icon = getIcon(active.icon);
                        return (
                          <span className="hidden size-14 shrink-0 place-items-center rounded-2xl border border-aqua-400/40 bg-aqua-400/10 text-aqua-400 shadow-[0_0_18px_rgb(46_230_214/0.25)] sm:grid">
                            <Icon className="size-6" aria-hidden="true" />
                          </span>
                        );
                      })()}
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.14em] text-aqua-400 uppercase [html[lang=km]_&]:tracking-normal">{s.sectorBlueprint}</p>
                        <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">{active.name}</h3>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-aqua-400/35 bg-aqua-400/10 px-4 py-2 text-sm font-semibold text-aqua-300">
                      <TrendingUp className="size-4" aria-hidden="true" />
                      {active.metric}
                    </span>
                  </div>

                  {/* challenge → solution */}
                  <div className="relative grid gap-4 p-6 sm:p-8 md:grid-cols-2 md:gap-6">
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] p-5 sm:p-6">
                      <p className="flex items-center gap-2 text-sm font-bold text-rose-300">
                        <span className="grid size-7 place-items-center rounded-lg bg-rose-400/15">
                          <AlertTriangle className="size-4" aria-hidden="true" />
                        </span>
                        {s.theChallenge}
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-white/72">{active.challenge}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 left-1/2 z-10 hidden size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-aqua-400/50 bg-night-900 text-aqua-400 shadow-[0_0_16px_rgb(46_230_214/0.35)] md:grid"
                    >
                      <ArrowRight className="size-4" />
                    </span>
                    <div className="rounded-2xl border border-aqua-400/30 bg-aqua-400/[0.07] p-5 sm:p-6">
                      <p className="flex items-center gap-2 text-sm font-bold text-aqua-300">
                        <span className="grid size-7 place-items-center rounded-lg bg-aqua-400/15">
                          <Lightbulb className="size-4" aria-hidden="true" />
                        </span>
                        {s.theSolution}
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-white/88">{active.solution}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 p-6 sm:p-8">
                    <p className="text-sm font-bold text-white">{s.deliveredCapabilities}</p>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {active.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/85">
                          <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-aqua-400" aria-hidden="true" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-white/55">{s.customNotice}</p>
                      <button
                        type="button"
                        onClick={() => onRequest({ systemType: 'Management System', projectName: active.name })}
                        className="btn-aqua shrink-0"
                      >
                        {s.requestBtn} {active.shortName}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Reveal>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
