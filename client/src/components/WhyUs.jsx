import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { getIcon } from '../lib/icons.js';
import { Reveal, SectionState, SectionTitle } from './ui.jsx';

export default function WhyUs({ items, loading, error, retry, onStart }) {
  const { t } = useI18n();
  const w = t.whyChoose;

  return (
    <section id="about" aria-labelledby="about-title" className="relative isolate overflow-hidden py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 xl:gap-20">
        {/* intro + story card */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionTitle id="about-title" tone="dark" align="left" badge={w.badge} headline={w.headline} lead={w.subheadline} />

          <Reveal delay={100} className="relative isolate mt-10 overflow-hidden rounded-[28px] border border-aqua-400/20 bg-night-900 p-7 text-white shadow-[0_30px_70px_-30px_rgb(0_0_0/0.9)] sm:p-9">
            {/* real Angkor Wat sunrise photo under a night wash */}
            <img
              src="/images/angkor-sunrise.jpg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 -z-10 size-full object-cover object-[50%_35%]"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgb(7_26_42/0.55)_0%,rgb(7_26_42/0.88)_45%,rgb(5_19_31/0.97)_100%)]" />
            <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-aqua-400/60 to-transparent" />

            <span className="inline-flex items-center gap-2 rounded-full border border-aqua-400/40 bg-aqua-400/10 px-3.5 py-1.5 text-xs font-bold text-aqua-300 backdrop-blur">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> {w.bannerBadge}
            </span>
            <h3 className="mt-5 text-2xl font-bold text-balance sm:text-[28px] sm:leading-tight">{w.bannerHeadline}</h3>
            <p className="mt-3 leading-relaxed text-white/72">{w.bannerDesc}</p>
            <button type="button" onClick={onStart} className="btn-aqua mt-7 px-6 py-3.5">
              <MessageCircle className="size-[18px]" aria-hidden="true" />
              {w.bannerBtn}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </Reveal>
        </div>

        {/* reasons */}
        <div>
          <SectionState loading={loading} error={error} retry={retry} skeleton={4} className="grid gap-5 sm:grid-cols-2" />
          {items && (
            <ol className="grid gap-5 sm:grid-cols-2 sm:pb-10">
              {items.map((item, i) => {
                const Icon = getIcon(item.icon);
                return (
                  <Reveal as="li" key={item.slug} delay={(i % 2) * 80} className={i % 2 ? 'sm:translate-y-10' : ''}>
                    <div className="card-night group relative flex h-full flex-col rounded-[24px] p-6 transition duration-300 hover:-translate-y-1 hover:border-aqua-400/50 hover:shadow-[0_28px_50px_-24px_rgb(0_0_0/0.8),0_0_26px_rgb(46_230_214/0.16)]">
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid size-13 place-items-center rounded-2xl border border-aqua-400/30 bg-gradient-to-b from-[#123a55] to-night-900 text-aqua-400 shadow-[0_10px_22px_-10px_rgb(0_0_0/0.6)] transition group-hover:shadow-[0_0_20px_rgb(46_230_214/0.4)]">
                          <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
                        </span>
                        <span className="font-mono text-3xl font-bold text-white/[0.08] transition group-hover:text-aqua-400/40" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="mt-5 inline-flex w-fit rounded-full bg-aqua-400/12 px-2.5 py-1 text-[11px] font-bold tracking-wider text-aqua-300 uppercase [html[lang=km]_&]:tracking-normal">
                        {item.badge}
                      </span>
                      <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">{item.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
