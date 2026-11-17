import { ArrowUp, ChevronRight, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { FEATURES } from '../lib/features.js';
import { Logo, TelegramIcon } from './ui.jsx';

const NAV = ['home', 'services', 'solutions', ...(FEATURES.portfolio ? ['portfolio'] : []), 'about', 'contact'];

const SOCIAL = 'grid size-11 place-items-center rounded-xl border border-aqua-400/25 bg-aqua-400/[0.06] text-aqua-400 transition hover:-translate-y-0.5 hover:border-aqua-400 hover:bg-aqua-400 hover:text-night-ink hover:shadow-[0_0_20px_rgb(46_230_214/0.45)]';
const LINK = 'group inline-flex items-center gap-1.5 transition hover:text-aqua-400';

function ColumnTitle({ children }) {
  return (
    <p className="text-sm font-bold text-white">
      {children}
      <span className="mt-2.5 block h-[2px] w-8 rounded-full bg-gradient-to-r from-aqua-400 to-transparent" aria-hidden="true" />
    </p>
  );
}

function LinkArrow() {
  return <ChevronRight className="size-3.5 -translate-x-1 text-aqua-400 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />;
}

function ContactRow({ icon: Icon, children }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-aqua-400/20 bg-aqua-400/[0.06] text-aqua-400">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

export default function Footer({ contact, services }) {
  const { t } = useI18n();
  const f = t.footer;

  return (
    <footer className="relative isolate overflow-hidden bg-night-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* teal hairline separating the footer from the contact section above */}
        <div className="container-page">
          <div className="h-px bg-gradient-to-r from-transparent via-aqua-400/45 to-transparent" />
        </div>
        <div className="bg-grid-dark absolute inset-0 [mask-image:linear-gradient(180deg,transparent,#000_40%)]" />
        <div className="absolute -bottom-32 left-[10%] h-72 w-[40rem] rounded-full bg-[#0f4561]/60 blur-[120px]" />
        <div className="absolute right-[-6%] bottom-[-10%] h-80 w-[36rem] rounded-full bg-aqua-500/10 blur-[130px]" />
        {/* Angkor Wat silhouette, subtle background layer */}
        <div className="angkor-silhouette absolute right-[-4%] bottom-[-18%] h-[340px] w-[620px] bg-[linear-gradient(180deg,rgb(46_230_214/0.16),rgb(46_230_214/0.02))]" />
      </div>

      <div className="container-page relative grid gap-12 pt-16 pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:pt-20">
        <div>
          <Logo dark />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">{f.bio}</p>
          <div className="mt-6 flex gap-2.5">
            {contact.telegramUrl && (
              <a href={contact.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className={SOCIAL}>
                <TelegramIcon className="size-[18px]" />
              </a>
            )}
            {contact.facebookUrl && (
              <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={SOCIAL}>
                <Facebook className="size-[18px]" aria-hidden="true" />
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} aria-label="Email" className={SOCIAL}>
                <Mail className="size-[18px]" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label={f.navigationTitle}>
          <ColumnTitle>{f.navigationTitle}</ColumnTitle>
          <ul className="mt-5 space-y-3 text-sm text-white/60">
            {NAV.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className={LINK}>
                  {t.nav[id]}
                  <LinkArrow />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ColumnTitle>{f.capabilitiesTitle}</ColumnTitle>
          <ul className="mt-5 space-y-3 text-sm text-white/60">
            {services.map((s) => (
              <li key={s.slug}>
                <a href="#services" className={LINK}>
                  {s.title}
                  <LinkArrow />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>{t.nav.contact}</ColumnTitle>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            {contact.email && (
              <ContactRow icon={Mail}>
                <a href={`mailto:${contact.email}`} className="transition hover:text-aqua-400">{contact.email}</a>
              </ContactRow>
            )}
            {contact.phone && (
              <ContactRow icon={Phone}>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="transition hover:text-aqua-400">{contact.phone}</a>
              </ContactRow>
            )}
            {contact.telegram && (
              <ContactRow icon={TelegramIcon}>
                <a href={contact.telegramUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-aqua-400">{contact.telegram}</a>
              </ContactRow>
            )}
            {contact.location && <ContactRow icon={MapPin}>{contact.location}</ContactRow>}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/[0.08] bg-night-950/60 backdrop-blur-sm">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>{f.copyright}</p>
          <a
            href="#home"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3.5 py-1.5 font-semibold text-white/70 transition hover:border-aqua-400/60 hover:text-aqua-400"
          >
            {f.backToTop}
            <span className="grid size-5 place-items-center rounded-full bg-aqua-400/15 text-aqua-400">
              <ArrowUp className="size-3" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
