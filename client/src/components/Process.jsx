import { useState } from 'react';
import { ArrowLeft, ArrowRight, PackageCheck } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { getIcon } from '../lib/icons.js';
import { Reveal, SectionState, SectionTitle } from './ui.jsx';

export default function Process({ items, loading, error, retry }) {
  const { t } = useI18n();
  const p = t.process;
  const [index, setIndex] = useState(0);
  const active = items?.[Math.min(index, (items?.length ?? 1) - 1)];

  return (
    <section id="process" aria-labelledby="process-title" className="relative py-20 lg:py-28">
      <div className="container-page">
        <SectionTitle id="process-title" tone="dark" badge={p.badge} headline={p.headline} lead={p.subheadline} />

        <div className="mt-14">
          <SectionState loading={loading} error={error} retry={retry} skeleton={1} />
          {active && (
            <Reveal>
              {/* stepper */}
              <ol className="relative grid grid-cols-3 gap-y-6 md:grid-cols-6">
                <div className="absolute top-7 right-[8%] left-[8%] hidden h-0.5 rounded-full bg-white/10 md:block" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-aqua-500 to-aqua-300 shadow-[0_0_12px_rgb(46_230_214/0.7)] transition-all duration-500"
                    style={{ width: `${(index / (items.length - 1)) * 100}%` }}
                  />
                </div>
                {items.map((step, i) => {
                  const Icon = getIcon(step.icon);
                  const state = i < index ? 'done' : i === index ? 'current' : 'todo';
                  return (
                    <li key={step.step} className="relative flex justify-center">
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-current={state === 'current' ? 'step' : undefined}
                        className="group flex flex-col items-center gap-3 text-center"
                      >
                        <span
                          className={`grid size-14 place-items-center rounded-2xl transition ${
                            state === 'current'
                              ? 'scale-110 bg-gradient-to-b from-[#5cf5e8] to-aqua-500 text-night-ink shadow-[0_0_28px_rgb(46_230_214/0.55)]'
                              : state === 'done'
                                ? 'border border-aqua-400/50 bg-aqua-400/15 text-aqua-300'
                                : 'border border-white/12 bg-night-900 text-white/55 group-hover:border-aqua-400/50 group-hover:text-aqua-300'
                          }`}
                        >
                          <Icon className="size-6" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block font-mono text-[11px] font-bold text-aqua-400">
                            {p.phasePrefix} {step.step}
                          </span>
                          <span className={`block text-sm font-bold ${state === 'current' ? 'text-white' : 'text-white/60'}`}>{step.phase}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* detail */}
              <div key={active.step} className="card-night mt-10 grid animate-fade-up gap-8 rounded-[28px] p-6 sm:p-10 lg:grid-cols-[1fr_340px]">
                <div>
                  <p className="font-mono text-sm font-bold text-aqua-400">
                    {active.step} / {String(items.length).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{active.title}</h3>
                  <p className="mt-2 font-semibold text-white/85">{active.summary}</p>
                  <p className="mt-4 leading-relaxed text-white/65">{active.details}</p>
                </div>
                <div className="flex flex-col justify-between gap-6 rounded-2xl border border-aqua-400/25 bg-aqua-400/[0.06] p-6">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold text-aqua-300">
                      <PackageCheck className="size-[18px]" aria-hidden="true" />
                      {p.deliverableLabel}
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">{active.deliverable}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIndex((i) => Math.max(0, i - 1))}
                      disabled={index === 0}
                      className="btn-night-sm flex-1 px-4 py-2.5"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" /> {t.form.back}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
                      disabled={index === items.length - 1}
                      className="btn-aqua flex-1 px-4 py-2.5"
                    >
                      {t.form.next} <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
