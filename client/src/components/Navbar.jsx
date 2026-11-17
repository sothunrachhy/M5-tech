import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Facebook, Github, Home, Linkedin, Mail, MapPin, Menu, Phone, Rocket, X, Youtube } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { FEATURES } from '../lib/features.js';
import { getIcon } from '../lib/icons.js';
import { FlagKH, FlagUK, Logo, TelegramIcon } from './ui.jsx';

const LINKS = [
  { id: 'home', key: 'home' },
  { id: 'services', key: 'services' },
  { id: 'solutions', key: 'solutions', menu: true },
  ...(FEATURES.portfolio ? [{ id: 'portfolio', key: 'portfolio' }] : []),
  { id: 'about', key: 'about' },
  { id: 'contact', key: 'contact' },
];

const LANGS = [
  { code: 'en', short: 'EN', label: 'English', Flag: FlagUK },
  { code: 'km', short: 'ភាសាខ្មែរ', label: 'ភាសាខ្មែរ', Flag: FlagKH },
];

// Social links in the utility bar. Each shows only when its URL is set in the
// `contact` row of site_settings (server/db/seed.sql).
const SOCIALS = [
  { key: 'linkedinUrl', label: 'LinkedIn', Icon: Linkedin },
  { key: 'facebookUrl', label: 'Facebook', Icon: Facebook },
  { key: 'youtubeUrl', label: 'YouTube', Icon: Youtube },
  { key: 'githubUrl', label: 'GitHub', Icon: Github },
  { key: 'telegramUrl', label: 'Telegram', Icon: TelegramIcon },
];

// Shared width for the utility bar and the floating nav.
const SHELL = 'mx-auto w-full max-w-[1492px] px-4 sm:px-6';

/** Highlights the nav item for the section currently in view. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function useDismiss(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);
  return ref;
}

const POPOVER = 'absolute z-50 rounded-2xl border border-aqua-400/20 bg-night-900/95 shadow-[0_24px_48px_rgb(0_0_0/0.45)] backdrop-blur-xl';

function LanguageMenu({ up = false }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);
  const current = LANGS.find((l) => l.code === lang);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.common.language}
        className="flex h-[50px] items-center gap-2.5 rounded-full border border-white/22 bg-night-900/50 px-[18px] text-[15px] font-semibold text-white transition hover:border-aqua-400/60"
      >
        <current.Flag className="h-[15px] w-[22px] rounded-[2px]" />
        {current.short}
        <ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.6} aria-hidden="true" />
      </button>
      {open && (
        <ul role="listbox" className={`${POPOVER} w-44 overflow-hidden p-1.5 ${up ? 'bottom-full left-0 mb-2' : 'right-0 mt-2'}`}>
          {LANGS.map(({ code, label, Flag }) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={lang === code}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/90 hover:bg-aqua-400/10"
              >
                <Flag className="h-3.5 w-5 rounded-[2px]" />
                <span className="flex-1">{label}</span>
                {lang === code && <Check className="size-4 text-aqua-400" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const LINK = 'flex items-center gap-2 rounded-full text-base font-medium whitespace-nowrap transition';

function SolutionsMenu({ label, active, modules, onSelectModule }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`${LINK} px-1 py-3 ${active ? 'text-aqua-400' : 'text-white hover:text-aqua-300'}`}
      >
        {label}
        <ChevronDown className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.6} aria-hidden="true" />
      </button>
      {open && (
        <div className={`${POPOVER} left-1/2 mt-2 w-80 -translate-x-1/2 p-2`}>
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-white/50 uppercase">{t.dashboard.eyebrow}</p>
          {modules.map((m) => {
            const Icon = getIcon(m.icon);
            return (
              <button
                key={m.slug}
                type="button"
                onClick={() => {
                  onSelectModule(m.slug);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-aqua-400/10"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-aqua-400/10 text-aqua-400 ring-1 ring-aqua-400/25">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-white">{m.name}</span>
              </button>
            );
          })}
          <a
            href="#solutions"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center justify-between rounded-xl bg-aqua-400/10 px-3 py-3 text-sm font-bold text-aqua-300 hover:bg-aqua-400/20"
          >
            {t.solutions.badge}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

function UtilityBar({ contact, hidden }) {
  const socials = SOCIALS.filter((s) => contact[s.key]);
  const item = 'flex items-center gap-2.5 hover:text-white';
  const sep = 'h-[18px] w-px bg-white/20';

  return (
    <div className={`hidden overflow-hidden transition-all duration-300 md:block ${hidden ? 'max-h-0 opacity-0' : 'max-h-[52px]'}`}>
      <div className={SHELL}>
        <div className="flex h-[52px] items-center gap-6 px-2 text-sm font-medium text-white/90">
          <span className={sep} aria-hidden="true" />
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className={item}>
              <Phone className="size-[18px] fill-aqua-400 text-aqua-400" aria-hidden="true" /> {contact.phone}
            </a>
          )}
          {contact.email && (
            <>
              <span className={sep} aria-hidden="true" />
              <a href={`mailto:${contact.email}`} className={item}>
                <Mail className="size-5 text-aqua-400" strokeWidth={2.2} aria-hidden="true" /> {contact.email}
              </a>
            </>
          )}
          {contact.location && (
            <>
              <span className={sep} aria-hidden="true" />
              <span className="hidden items-center gap-2.5 lg:flex">
                <MapPin className="size-5 fill-aqua-400 text-night-900" aria-hidden="true" /> {contact.location}
              </span>
            </>
          )}
          {socials.length > 0 && (
            <ul className="ml-auto flex items-center gap-[22px]">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a
                    href={contact[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-6 place-items-center text-white transition hover:text-aqua-400"
                  >
                    <Icon className="size-[21px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <span className={`${sep} ${socials.length ? '' : 'ml-auto'}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function Navbar({ modules, onSelectModule, onStart, contact = {} }) {
  const { t } = useI18n();
  const active = useActiveSection(LINKS.map((l) => l.id));
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    if (!mobileOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <UtilityBar contact={contact} hidden={scrolled} />

      <div className={`${SHELL} transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-3 md:pt-1.5'}`}>
        <nav
          className={`flex h-[72px] items-center justify-between gap-4 rounded-[18px] border px-4 transition-all duration-300 sm:px-5 lg:h-[84px] lg:px-6 2xl:px-8 ${
            scrolled
              ? 'border-aqua-400/25 bg-night-900/90 shadow-[0_14px_40px_rgb(0_0_0/0.45)] backdrop-blur-xl'
              : 'border-aqua-400/22 bg-[linear-gradient(90deg,rgb(14_44_68/0.75),rgb(10_34_54/0.6))] shadow-[0_10px_30px_rgb(0_0_0/0.35)] backdrop-blur-[20px]'
          }`}
          aria-label="Main"
        >
          <a href="#home" aria-label="M5-Tech home" className="shrink-0">
            <Logo dark />
          </a>

          <ul className="hidden items-center gap-[20px] lg:flex xl:gap-[18px] 2xl:gap-[45px]">
            {LINKS.map(({ id, key, menu }) => (
              <li key={id}>
                {menu && FEATURES.dashboardPreview ? (
                  <SolutionsMenu label={t.nav[key]} active={active === id} modules={modules} onSelectModule={onSelectModule} />
                ) : (
                  <a
                    href={`#${id}`}
                    aria-current={active === id ? 'true' : undefined}
                    className={`${LINK} ${
                      active === id
                        ? 'border-[1.5px] border-aqua-400/80 bg-[linear-gradient(180deg,rgb(46_230_214/0.2),rgb(46_230_214/0.06))] px-[22px] py-[11px] font-semibold text-white shadow-[0_0_16px_rgb(46_230_214/0.35)]'
                        : 'px-1 py-3 text-white hover:text-aqua-300'
                    }`}
                  >
                    {id === 'home' && <Home className="size-5 fill-white" aria-hidden="true" />}
                    {t.nav[key]}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageMenu />
            </div>
            <button type="button" onClick={onStart} className="btn-aqua hidden shrink-0 px-5 py-[15px] text-base whitespace-nowrap md:inline-flex lg:hidden xl:inline-flex xl:px-4 xl:text-[15px] 2xl:px-5 2xl:text-base">
              <Rocket className="size-[22px]" aria-hidden="true" />
              {t.nav.startProject}
              <ArrowRight className="size-[18px]" strokeWidth={2.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-11 place-items-center rounded-full border border-white/22 bg-night-900/50 text-white lg:hidden"
              aria-label={t.common.menu}
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.common.menu}>
          <div className="absolute inset-0 bg-night-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] animate-fade-up flex-col border-l border-aqua-400/20 bg-night-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo dark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-white"
                aria-label={t.common.close}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="mt-8 space-y-1">
              {LINKS.map(({ id, key }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold ${
                      active === id ? 'bg-aqua-400/12 text-aqua-300 ring-1 ring-aqua-400/40' : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {t.nav[key]}
                    <ArrowRight className="size-4 opacity-40" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto space-y-3 pt-6">
              <LanguageMenu up />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onStart();
                }}
                className="btn-aqua w-full py-3.5"
              >
                {t.nav.startProject}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
