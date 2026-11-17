import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { Reveal, SectionState, SectionTitle, TelegramIcon } from './ui.jsx';

export default function Faq({ items, loading, error, retry, contact }) {
  const { t } = useI18n();
  const f = t.faq;
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionTitle id="faq-title" tone="dark" align="left" badge={f.badge} headline={f.headline} lead={f.subheadline} />
          <Reveal className="card-night mt-10 flex rounded-[22px] flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start">
            <div>
              <p className="font-bold text-white">{f.unansweredTitle}</p>
              <p className="mt-1 text-sm text-white/60">{f.unansweredSub}</p>
            </div>
            {contact.telegramUrl && (
              <a href={contact.telegramUrl} target="_blank" rel="noopener noreferrer" className="btn bg-[#229ED9] text-white shadow-[0_8px_20px_-6px_rgb(34_158_217/0.7)] hover:bg-[#1b8dc3]">
                <TelegramIcon className="size-4.5" />
                {f.chatTelegramBtn}
              </a>
            )}
          </Reveal>
        </div>

        <div>
          <SectionState loading={loading} error={error} retry={retry} skeleton={1} />
          {items && (
            <ul className="space-y-3">
              {items.map((item, i) => {
                const isOpen = open === i;
                const id = `faq-${item.slug}`;
                return (
                  <li key={item.slug} className={`card-night overflow-hidden rounded-[20px] transition ${isOpen ? 'border-aqua-400/45 shadow-[0_0_26px_rgb(46_230_214/0.14)]' : 'hover:border-aqua-400/30'}`}>
                    <h3>
                      <button
                        type="button"
                        id={`${id}-q`}
                        aria-expanded={isOpen}
                        aria-controls={`${id}-a`}
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                      >
                        <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold ${isOpen ? 'bg-gradient-to-b from-[#5cf5e8] to-aqua-500 text-night-ink' : 'border border-aqua-400/25 bg-aqua-400/10 text-aqua-300'}`}>
                          Q{i + 1}
                        </span>
                        <span className="flex-1 font-bold text-white">{item.question}</span>
                        <ChevronDown className={`size-5 shrink-0 transition ${isOpen ? 'rotate-180 text-aqua-400' : 'text-white/50'}`} aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      id={`${id}-a`}
                      role="region"
                      aria-labelledby={`${id}-q`}
                      className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-6 sm:px-6 sm:pl-[4.75rem]">
                          <p className="leading-relaxed text-white/68">{item.answer}</p>
                          <p className="mt-3 text-xs font-semibold text-aqua-400">
                            {f.topicPrefix} {item.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
