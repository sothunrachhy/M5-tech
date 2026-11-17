import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';

/**
 * Orbit ring of light around the M5 tile. Drawn twice by LogoMark: the full ring behind the tile,
 * and only its lower (front) half above it, so the ring and its comet appear to circle the tile.
 * Centred on (0,0); the outer group squashes and tilts a circle into the ellipse, and the inner
 * group spins, so the comet follows the ellipse.
 */
function Orbit({ id, front = false }) {
  return (
    <svg viewBox="-60 -32 120 64" className="pointer-events-none absolute top-1/2 left-1/2 h-[93%] w-[175%] -translate-x-1/2 -translate-y-1/2 overflow-visible">
      <defs>
        <clipPath id={`${id}-front`}>
          <rect x="-60" y="0" width="120" height="60" />
        </clipPath>
      </defs>
      <g transform="rotate(-16) scale(1 0.34)" clipPath={front ? `url(#${id}-front)` : undefined}>
        <circle r="50" fill="none" stroke="#2ee6d6" strokeOpacity={front ? 0.28 : 0.16} strokeWidth="11" />
        <circle r="50" fill="none" stroke="#2ee6d6" strokeOpacity={front ? 1 : 0.6} strokeWidth="3.2" />
        <circle r="50" fill="none" stroke="#d9fffb" strokeOpacity={front ? 0.8 : 0.35} strokeWidth="1.2" />
        {/* comet: tail + head, spinning around the ring */}
        <g className="animate-logo-orbit">
          <circle r="50" fill="none" stroke="#bafcf6" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="34 280" />
          <circle r="50" fill="none" stroke="#2ee6d6" strokeOpacity="0.35" strokeWidth="9" strokeLinecap="round" strokeDasharray="34 280" />
          <circle cx="38.9" cy="31.4" r="4.2" fill="#ffffff" />
          <circle cx="38.9" cy="31.4" r="9" fill="#2ee6d6" fillOpacity="0.45" />
        </g>
      </g>
    </svg>
  );
}

/** M5 mark: glowing glass tile circled by an orbit of light. `size` is the tile height in px. */
export function LogoMark({ size = 56, className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <span aria-hidden="true" className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <Orbit id={id} />
      <span
        className="relative grid size-full place-items-center border-2 border-aqua-400 bg-[linear-gradient(160deg,#103955,#071a2a_62%)] shadow-[0_0_0_1px_rgb(46_230_214/0.25),0_0_18px_rgb(46_230_214/0.55),inset_0_0_14px_rgb(46_230_214/0.35)]"
        style={{ borderRadius: Math.round(size * 0.24) }}
      >
        <span className="pointer-events-none absolute inset-[3px] border border-aqua-400/30" style={{ borderRadius: Math.round(size * 0.24) - 3 }} />
        <span className="font-sans leading-none font-extrabold tracking-[-0.06em]" style={{ fontSize: Math.round(size * 0.5) }}>
          <span className="text-white">M</span>
          <span className="bg-gradient-to-b from-[#7ff7ee] to-aqua-500 bg-clip-text text-transparent">5</span>
        </span>
      </span>
      <Orbit id={`${id}f`} front />
    </span>
  );
}

export function Logo({ dark = false, className = '' }) {
  return (
    <span className={`flex items-center gap-3.5 sm:gap-[18px] ${className}`}>
      <span className="ml-2 flex sm:hidden">
        <LogoMark size={42} />
      </span>
      <span className="ml-3 hidden sm:flex">
        <LogoMark size={54} />
      </span>
      <span
        aria-hidden="true"
        className={`h-10 w-px bg-gradient-to-b from-transparent to-transparent sm:h-12 ${dark ? 'via-white/45' : 'via-ink-900/30'}`}
      />
      <span className="leading-none">
        <span className={`block font-sans text-[23px] font-bold tracking-tight sm:text-[27px] ${dark ? 'text-white' : 'text-ink-900'}`}>
          M5-
          <span className={dark ? 'bg-gradient-to-r from-[#7ff7ee] to-aqua-500 bg-clip-text text-transparent' : 'text-brand-600'}>Tech</span>
        </span>
        <span className={`mt-1.5 block font-sans text-[9px] font-semibold tracking-[0.22em] whitespace-nowrap uppercase sm:text-[10px] sm:tracking-[0.34em] ${dark ? 'text-white/80' : 'text-slate-ink'}`}>
          Technology Solution
        </span>
      </span>
    </span>
  );
}

/**
 * Splits a headline into plain text and its last word (the accent), dropping a final "." or "។".
 * Khmer has no spaces, so the i18n files mark the split with a zero-width space (U+200B).
 */
export function splitAccent(headline) {
  const text = headline.replace(/[.។]$/, '');
  const cut = Math.max(text.lastIndexOf(' '), text.lastIndexOf('​'));
  if (cut <= 0) return { plain: '', sep: '', accent: text };
  return { plain: text.slice(0, cut), sep: text[cut], accent: text.slice(cut + 1) };
}

const TITLE_TONES = {
  dark: {
    rule: 'to-aqua-400/70',
    pill: 'border-aqua-400/75 bg-aqua-400/7 text-aqua-400 shadow-[0_0_12px_rgb(46_230_214/0.25)]',
    heading: 'bg-[linear-gradient(180deg,#aebdcb,#ffffff_70%)] bg-clip-text text-transparent',
    accent: 'text-aqua-400',
    swoosh: 'text-aqua-400 [filter:drop-shadow(0_0_5px_rgb(46_230_214/0.7))]',
    lead: 'text-white/70',
  },
  light: {
    rule: 'to-aqua-600/55',
    pill: 'border-aqua-600/45 bg-white text-aqua-700 shadow-[0_6px_18px_-8px_rgb(14_165_172/0.45)]',
    heading: 'text-night-900',
    accent: 'bg-gradient-to-r from-aqua-600 to-aqua-700 bg-clip-text text-transparent',
    swoosh: 'text-aqua-500',
    lead: 'text-slate-ink',
  },
};

/** Pill badge between fading rules, then a heading whose last word is aqua and underlined. */
export function SectionTitle({ id, badge, headline, lead, tone = 'light', align = 'center', className = '' }) {
  const c = TITLE_TONES[tone];
  const centered = align === 'center';
  const { plain, sep, accent } = splitAccent(headline);
  const rule = `h-[1.5px] min-w-0 shrink bg-gradient-to-r from-transparent ${c.rule}`;

  return (
    <Reveal className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''} ${className}`}>
      <div className={`flex items-center gap-5 ${centered ? 'justify-center' : ''}`}>
        {centered && <span className={`${rule} w-[200px]`} aria-hidden="true" />}
        <span
          className={`shrink-0 rounded-full border-[1.3px] px-[17px] py-[8px] text-[13px] font-bold tracking-[0.06em] uppercase [html[lang=km]_&]:tracking-normal [html[lang=km]_&]:normal-case ${c.pill}`}
        >
          {badge}
        </span>
        <span className={`${rule} w-[200px] -scale-x-100`} aria-hidden="true" />
      </div>
      <h2
        id={id}
        className={`mt-5 text-[clamp(2rem,3vw,3rem)] leading-[1.1] font-bold tracking-[-0.015em] text-balance ${centered ? 'mx-auto' : ''} ${c.heading}`}
      >
        {plain}
        {sep}
        <span className="relative inline-block pb-1">
          <span className={c.accent}>{accent}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 190 18"
            preserveAspectRatio="none"
            className={`absolute -bottom-2.5 -left-[3%] h-[14px] w-[106%] ${c.swoosh}`}
          >
            <path d="M3 15C55 4 125 1 185 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        </span>
      </h2>
      {lead && <p className={`mt-7 text-base text-pretty sm:text-lg ${centered ? 'mx-auto max-w-2xl' : ''} ${c.lead}`}>{lead}</p>}
    </Reveal>
  );
}

export function SectionHeader({ eyebrow, icon: Icon, title, lead, align = 'center', dark = false }) {
  const centered = align === 'center';
  return (
    <Reveal className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <span className={dark ? 'eyebrow border-white/15 bg-white/10 text-glow shadow-none' : 'eyebrow'}>
          {Icon && <Icon className="size-3.5" aria-hidden="true" />}
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.1] ${dark ? 'text-white' : 'text-ink-900'}`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-base text-pretty sm:text-lg ${dark ? 'text-white/70' : 'text-slate-ink'}`}>{lead}</p>
      )}
    </Reveal>
  );
}

/** Loading skeleton / error with retry for API-backed sections. */
export function SectionState({ loading, error, retry, skeleton = 3, className = '' }) {
  const { t } = useI18n();
  if (error) {
    return (
      <div role="alert" className="card-night mx-auto flex max-w-md flex-col items-center gap-3 rounded-[22px] p-8 text-center">
        <AlertCircle className="size-8 text-rose-400" aria-hidden="true" />
        <p className="font-semibold text-white">{t.common.loadError}</p>
        <button type="button" onClick={retry} className="btn-night-sm px-4 py-2">
          <RotateCw className="size-4" aria-hidden="true" /> {t.common.retry}
        </button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={className} aria-busy="true" aria-label={t.common.loading}>
        {Array.from({ length: skeleton }, (_, i) => (
          <div key={i} className="card-night h-64 animate-pulse rounded-[22px]" />
        ))}
      </div>
    );
  }
  return null;
}

/** Fades children in the first time they scroll into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} ${shown ? 'animate-fade-up' : 'opacity-0'}`}
      style={shown && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Shows a portrait 3D illustration in a wide banner: a blurred copy of the same
 * image fills the sides so the banner background always matches the artwork.
 */
export function ImageBanner({ src, alt = '', className = '', dark = false }) {
  return (
    <div className={`relative isolate overflow-hidden ${dark ? 'bg-night-800' : 'bg-[#eef1f8]'} ${className}`}>
      <img src={src} alt="" aria-hidden="true" className={`absolute inset-0 -z-10 size-full scale-150 object-cover blur-3xl ${dark ? 'opacity-25' : 'opacity-50'}`} />
      <div
        className={`absolute inset-0 -z-10 ${
          dark
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(11_36_56/0.9)_75%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(238_241_248/0.85)_75%)]'
        }`}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="mx-auto h-full w-auto scale-[1.15] object-contain transition duration-500 [mask-image:radial-gradient(ellipse_62%_58%_at_center,black_55%,transparent_100%)] group-hover:scale-125"
      />
    </div>
  );
}

export function TelegramIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.94 4.3a1.2 1.2 0 0 0-1.6-1.33L2.9 9.68c-1.08.42-1.07 1.95.02 2.35l4.25 1.56 1.64 5.3c.22.72 1.12.95 1.66.42l2.4-2.33 4.43 3.27c.66.49 1.6.12 1.77-.68L21.94 4.3ZM9.6 13.9l8.35-6.2-6.8 7.33-.27 2.92-1.28-4.05Z" />
    </svg>
  );
}

export function FlagUK({ className = '' }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id="uk-s"><path d="M0 0v30h60V0z" /></clipPath>
      <clipPath id="uk-t"><path d="M30 15h30v15zv15H0zH0V0zV0h30z" /></clipPath>
      <g clipPath="url(#uk-s)">
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function FlagKH({ className = '' }) {
  // Official flag of Cambodia (public domain, Wikimedia Commons).
  return <img src="/images/flag-kh.svg" alt="" aria-hidden="true" className={`object-cover ${className}`} />;
}

