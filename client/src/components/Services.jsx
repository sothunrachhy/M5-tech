import { ArrowUpRight, Check } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { getIcon } from '../lib/icons.js';
import TechBadge from './TechBadge.jsx';
import { ImageBanner, Reveal, SectionState, SectionTitle } from './ui.jsx';

const SYSTEM_TYPE = {
  'web-app': 'Web Application',
  'mobile-app': 'Mobile Application',
  'management-systems': 'Management System',
};

export default function Services({ items, loading, error, retry, onInquire }) {
  const { t } = useI18n();
  const s = t.services;

  return (
    <section id="services" aria-labelledby="services-title" className="relative isolate overflow-hidden py-20 lg:py-28">
      <div className="container-page">
        <SectionTitle id="services-title" tone="dark" badge={s.badge} headline={s.headline} lead={s.subheadline} />

        <div className="mt-16">
          <SectionState loading={loading} error={error} retry={retry} skeleton={6} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" />
          {items && (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => {
                const Icon = getIcon(item.icon);
                return (
                  <Reveal
                    as="li"
                    key={item.slug}
                    delay={(i % 3) * 80}
                    className="card-night group relative flex flex-col rounded-[26px] p-2 transition duration-300 hover:-translate-y-1 hover:border-aqua-400/50 hover:shadow-[0_28px_50px_-22px_rgb(0_0_0/0.8),0_0_28px_rgb(46_230_214/0.16)]"
                  >
                    {/* dark artwork banner with the service number and icon tile */}
                    <div className="relative">
                      <ImageBanner dark src={item.image} className="h-48 rounded-[20px] border border-white/[0.06]" />
                      <span className="absolute top-4 right-5 font-mono text-sm font-semibold text-white/55">{String(i + 1).padStart(2, '0')}</span>
                      <span className="absolute -bottom-6 left-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-b from-[#123a55] to-night-900 text-aqua-400 shadow-[0_10px_24px_-8px_rgb(7_26_42/0.6),0_0_18px_rgb(46_230_214/0.25)] ring-4 ring-[#0d2a40]">
                        <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col px-5 pt-10 pb-5">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-aqua-400">{item.tagline}</p>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">{item.description}</p>

                      <ul className="mt-5 space-y-2.5">
                        {item.highlights.map((h) => (
                          <li key={h} className="flex gap-2.5 text-sm font-medium text-white/80">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-aqua-400/15 text-aqua-400 ring-1 ring-aqua-400/30">
                              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                            </span>
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-6">
                        <div className="flex flex-wrap gap-2 border-t border-dashed border-white/12 pt-5">
                          {item.techStack.map((tech, n) => (
                            <TechBadge key={tech} name={tech} index={i * 3 + n} />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onInquire({ systemType: SYSTEM_TYPE[item.slug] ?? 'Other', projectName: item.title })}
                          className="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-bold text-white transition group-hover:border-aqua-400/40 group-hover:bg-aqua-400/10"
                        >
                          {s.inquireBtn}
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-aqua-400/15 text-aqua-400 transition group-hover:bg-aqua-400 group-hover:text-night-ink">
                            <ArrowUpRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
