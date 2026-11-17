import { ArrowRight, ChartNoAxesColumnIncreasing, CloudUpload, Code, Gem, Handshake, Headset, Play, Rocket, ShieldCheck, AlignLeft, Zap } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { FEATURES } from '../lib/features.js';

const TRUST_ICONS = [Gem, Headset, ShieldCheck, Handshake];

// Neon glass tiles floating over the temple artwork. Position and size are % of the artwork box.
const TILES = [
  { Icon: Code, left: 38.4, top: 19, w: 9.4, h: 13.5, r: '-4deg', delay: '0s' },
  { Icon: CloudUpload, left: 70.6, top: 19.6, w: 9.9, h: 13.5, r: '4deg', delay: '-2s' },
  { Icon: ChartNoAxesColumnIncreasing, left: 84.8, top: 31.6, w: 8.8, h: 12.6, r: '-3deg', delay: '-4s' },
  { Icon: AlignLeft, left: 31.1, top: 37.4, w: 6.7, h: 9, r: '5deg', delay: '-1s' },
];

function FloatingTiles() {
  return TILES.map(({ Icon, left, top, w, h, r, delay }) => (
    <span
      key={left}
      className="absolute animate-float"
      style={{ left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`, '--r': r, animationDelay: delay }}
    >
      <span className="neon-tile-halo" />
      <span className="neon-tile">
        <span className="neon-tile-glint -top-[9%] -left-[9%]" />
        <span className="neon-tile-glint -right-[9%] -bottom-[9%] opacity-80" />
        <Icon className="neon-tile-icon" strokeWidth={3} />
      </span>
    </span>
  ));
}

/** Glowing aqua light streaks sweeping across the lower hero. */
function LightWaves({ className = '' }) {
  return (
    <svg viewBox="0 0 1672 420" preserveAspectRatio="none" fill="none" className={className}>
      <defs>
        <linearGradient id="wave-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2ee6d6" stopOpacity="0.22" />
          <stop offset="0.8" stopColor="#2ee6d6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="[filter:drop-shadow(0_0_6px_rgb(46_230_214/0.85))]">
        <path d="M0 30C140 44 230 86 330 120S520 190 640 205" stroke="#2ee6d6" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 46C150 62 250 104 360 140S540 205 660 220" stroke="#2ee6d6" strokeOpacity="0.45" strokeWidth="1.4" />
        <path d="M0 62C160 80 270 124 380 162S560 220 680 235" stroke="#58c9ff" strokeOpacity="0.3" />
        <path d="M980 420C1200 380 1420 280 1672 180V420Z" fill="url(#wave-water)" />
        <path d="M980 420C1200 380 1420 280 1672 180" stroke="#2ee6d6" strokeWidth="3" strokeLinecap="round" />
        <path d="M1060 420C1260 392 1460 312 1672 232" stroke="#2ee6d6" strokeOpacity="0.45" strokeWidth="1.2" />
      </g>
      {/* light travelling along the waves (kept outside the filtered group so it stays cheap) */}
      <g strokeLinecap="round" fill="none">
        <path d="M0 30C140 44 230 86 330 120S520 190 640 205" stroke="#d9fffb" strokeWidth="3.2" strokeDasharray="70 640" className="animate-wave-flow" style={{ '--to': -710, '--d': '4s' }} />
        <path d="M0 30C140 44 230 86 330 120S520 190 640 205" stroke="#2ee6d6" strokeOpacity="0.35" strokeWidth="10" strokeDasharray="70 640" className="animate-wave-flow" style={{ '--to': -710, '--d': '4s' }} />
        <path d="M0 62C160 80 270 124 380 162S560 220 680 235" stroke="#58c9ff" strokeWidth="1.6" strokeDasharray="40 660" className="animate-wave-flow" style={{ '--to': -700, '--d': '6s', animationDelay: '-2s' }} />
        <path d="M980 420C1200 380 1420 280 1672 180" stroke="#d9fffb" strokeWidth="3.2" strokeDasharray="90 700" className="animate-wave-flow" style={{ '--to': -790, '--d': '5s', animationDelay: '-1s' }} />
        <path d="M980 420C1200 380 1420 280 1672 180" stroke="#2ee6d6" strokeOpacity="0.35" strokeWidth="10" strokeDasharray="90 700" className="animate-wave-flow" style={{ '--to': -790, '--d': '5s', animationDelay: '-1s' }} />
        <path d="M1060 420C1260 392 1460 312 1672 232" stroke="#8b5cf6" strokeWidth="1.6" strokeDasharray="50 700" className="animate-wave-flow" style={{ '--to': -750, '--d': '7s', animationDelay: '-3s' }} />
      </g>
    </svg>
  );
}

// Deterministic pseudo-random values, so every render and reload looks the same.
const rnd = (i, n) => (Math.sin((i + 1) * n) + 1) / 2;

// Stars in the sky above the temple (% of the artwork box).
const STARS = Array.from({ length: 22 }, (_, i) => ({
  left: 6 + rnd(i, 12.99) * 90,
  top: 3 + rnd(i, 78.23) * 26,
  size: rnd(i, 3.7) > 0.7 ? 3 : 2,
  d: `${(2.2 + rnd(i, 5.1) * 3).toFixed(1)}s`,
  delay: `${(-rnd(i, 9.4) * 5).toFixed(1)}s`,
}));

// Fireflies rising off the water.
const FIREFLIES = Array.from({ length: 16 }, (_, i) => ({
  left: 8 + rnd(i, 4.13) * 86,
  top: 62 + rnd(i, 7.7) * 26,
  size: rnd(i, 2.9) > 0.6 ? 4 : 3,
  d: `${(6 + rnd(i, 6.3) * 6).toFixed(1)}s`,
  delay: `${(-rnd(i, 8.8) * 10).toFixed(1)}s`,
  x: `${((rnd(i, 1.9) - 0.5) * 90).toFixed(0)}px`,
  rgb: i % 4 === 0 ? '139 92 246' : i % 3 === 0 ? '61 142 255' : '46 230 214',
}));

// Light glinting across the water reflection.
const SHIMMERS = [
  { top: 72, left: 18, w: 34, d: '6s', delay: '0s', o: 0.9 },
  { top: 78, left: 40, w: 40, d: '7.5s', delay: '-2.5s', o: 0.7 },
  { top: 84, left: 12, w: 30, d: '6.8s', delay: '-4s', o: 0.6 },
  { top: 89, left: 46, w: 36, d: '8s', delay: '-1.2s', o: 0.5 },
  { top: 75, left: 60, w: 26, d: '5.6s', delay: '-3.3s', o: 0.8 },
];

/** Twinkling stars, rising fireflies and water shimmer layered over the temple artwork. */
function TempleMotion() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_30%)]">
      {STARS.map((s, i) => (
        <span
          key={`s${i}`}
          className="absolute animate-twinkle rounded-full bg-white shadow-[0_0_6px_rgb(186_252_246/0.9)]"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: s.delay, '--d': s.d }}
        />
      ))}
      {SHIMMERS.map((w, i) => (
        <span
          key={`w${i}`}
          className="absolute h-[2px] animate-shimmer rounded-full bg-gradient-to-r from-transparent via-[#bafcf6] to-transparent shadow-[0_0_10px_rgb(46_230_214/0.9)]"
          style={{ top: `${w.top}%`, left: `${w.left}%`, width: `${w.w}%`, animationDelay: w.delay, '--d': w.d, '--o': w.o }}
        />
      ))}
      {FIREFLIES.map((f, i) => (
        <span
          key={`f${i}`}
          className="absolute animate-speck rounded-full"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            background: `rgb(${f.rgb})`,
            boxShadow: `0 0 ${f.size * 3}px rgb(${f.rgb} / 0.95)`,
            animationDelay: f.delay,
            '--d': f.d,
            '--x': f.x,
            '--o': 0.95,
          }}
        />
      ))}
    </div>
  );
}

const SWEEPS = [
  { top: '34%', w: '40vw', rgb: '46 230 214', d: '10s', delay: '-2s', a: '-20deg' },
  { top: '62%', w: '32vw', rgb: '61 142 255', d: '13s', delay: '-8s', a: '-14deg' },
];

/**
 * Night backdrop behind the hero, the optional dashboard preview and the capabilities
 * section: navy gradient, neon Angkor Wat artwork (slow zoom, stars, fireflies, water shimmer),
 * flowing light waves, circuit pulses, drifting glows and light sweeps.
 * Rendered once by App inside the wrapper that holds those sections.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#0b2438_0px,#07192a_520px,#05131f_1100px,#05131f)]">
      {/* soft glows */}
      <div className="absolute -top-40 -left-52 h-[500px] w-[700px] animate-aurora-a rounded-full bg-[#123a57]/60 blur-[140px]" />
      <div className="absolute top-40 -right-10 h-[520px] w-[760px] animate-aurora-b rounded-full bg-[#1bb7c6]/16 blur-[160px]" />
      <div className="absolute top-[420px] left-[28%] h-[360px] w-[520px] animate-aurora-d rounded-full bg-[#3d8eff]/12 blur-[140px]" />
      <div className="absolute top-[760px] left-[12%] h-[320px] w-[78%] animate-aurora-c rounded-full bg-[#0f4561]/55 blur-[130px]" />

      {/* temple artwork: right side on desktop, faint full-width layer on smaller screens */}
      <div className="absolute top-[110px] right-0 hidden w-[56vw] max-w-[1100px] lg:block">
        <img src="/images/angkor-neon.jpg" alt="" fetchPriority="high" className="hero-art-fade aspect-[3/2] w-full origin-[60%_55%] animate-ken-burns object-cover" />
        <TempleMotion />
        <FloatingTiles />
      </div>
      <img
        src="/images/angkor-neon.jpg"
        alt=""
        className="hero-art-fade absolute top-[90px] right-0 aspect-[3/2] w-[130%] max-w-none origin-[60%_55%] animate-ken-burns object-cover opacity-25 sm:w-full sm:opacity-35 lg:hidden"
      />

      {/* circuit traces, top-left */}
      <svg viewBox="0 0 140 230" fill="none" className="absolute top-7 left-0 hidden h-[230px] w-[140px] md:block">
        <g stroke="#2ee6d6" strokeOpacity="0.55" strokeWidth="1.3">
          <path d="M0 150 52 98h6M0 128l40-40M0 182l62-62 56 30M0 214l30-30" />
        </g>
        {/* pulses running along the traces */}
        <g stroke="#d9fffb" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M0 150 52 98h6" strokeDasharray="14 120" className="animate-wave-flow" style={{ '--to': -134, '--d': '2.6s' }} />
          <path d="M0 182l62-62 56 30" strokeDasharray="14 160" className="animate-wave-flow" style={{ '--to': -174, '--d': '3.4s', animationDelay: '-1.2s' }} />
          <path d="M0 128l40-40" strokeDasharray="10 100" className="animate-wave-flow" style={{ '--to': -110, '--d': '2.2s', animationDelay: '-0.6s' }} />
        </g>
        <circle cx="58" cy="98" r="3" fill="#2ee6d6" className="animate-twinkle" style={{ '--d': '2.4s' }} />
        <circle cx="118" cy="150" r="3" fill="#2ee6d6" className="animate-twinkle" style={{ '--d': '3s', animationDelay: '-1s' }} />
        <circle cx="40" cy="88" r="2" fill="#2ee6d6" fillOpacity="0.7" />
      </svg>

      <LightWaves className="absolute top-[521px] left-0 h-[420px] w-full" />

      {/* occasional light sweeps */}
      {SWEEPS.map((b, i) => (
        <div
          key={i}
          className="absolute left-0 h-px animate-beam"
          style={{
            top: b.top,
            width: b.w,
            background: `linear-gradient(90deg, transparent, rgb(${b.rgb} / 0.85), transparent)`,
            boxShadow: `0 0 14px rgb(${b.rgb} / 0.8)`,
            animationDelay: b.delay,
            '--d': b.d,
            '--a': b.a,
          }}
        />
      ))}

      {/* dot grids */}
      <div className="bg-dots-night absolute top-[800px] left-4 h-[136px] w-[110px] animate-dots-pulse [mask-image:linear-gradient(180deg,transparent,#000)]" />
      <div className="bg-dots-night absolute top-[800px] right-4 h-[136px] w-[110px] animate-dots-pulse [animation-delay:-2s] [mask-image:linear-gradient(180deg,transparent,#000)]" />

      {/* hand over to the moving night background below */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-night-950" />
    </div>
  );
}

export default function Hero({ onStart }) {
  const { t, lang } = useI18n();
  const h = t.hero;
  // "Powerful Digital Solutions." → plain "Powerful Digital", accent "Solutions", mark "."
  // Khmer has no spaces, so km.json marks the split with a zero-width space (U+200B).
  const [, body, mark = ''] = h.headlineHighlight.match(/^(.*?)([.។]?)$/);
  const cut = Math.max(body.lastIndexOf(' '), body.lastIndexOf('​'));
  const plain = cut > 0 ? body.slice(0, cut) : '';
  const accent = cut > 0 ? body.slice(cut + 1) : body;
  const en = lang === 'en';

  return (
    <section id="home" className="relative pt-32 md:pt-[180px] lg:pt-[200px]">
      <div className="container-page relative">
        <div className="relative z-10 max-w-[860px] animate-fade-up">
          <p className="flex items-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-aqua-400/35 bg-aqua-400/8 py-[7px] pr-3.5 pl-2.5 text-sm font-medium text-white/95">
              <span className="grid size-[18px] place-items-center rounded-full bg-aqua-400" aria-hidden="true">
                <Zap className="size-3 fill-night-900 text-night-900" />
              </span>
              {h.tagline}
            </span>
            <span className="h-px w-7 bg-gradient-to-r from-aqua-400/50 to-transparent" aria-hidden="true" />
          </p>

          <h1
            className={`mt-4 font-bold text-white ${
              en ? 'text-[clamp(2.4rem,3.9vw,4.06rem)] leading-[1.02] tracking-[-0.01em]' : 'text-[clamp(1.9rem,2.8vw,3rem)] leading-[1.32]'
            }`}
          >
            <span className="lg:block lg:whitespace-nowrap">{h.headline1}</span>{' '}
            <span className="lg:whitespace-nowrap">
              {plain}
              {en && plain ? ' ' : ''}
              <span className="bg-gradient-to-r from-aqua-300 to-[#22d4d0] bg-clip-text whitespace-nowrap text-transparent">
                {accent}
                {mark}
              </span>
            </span>
          </h1>

          <p className="mt-5 max-w-[620px] text-lg leading-[29px] text-pretty text-white/86">{h.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-[25px]">
            <button type="button" onClick={onStart} className="btn-aqua h-[60px] gap-3.5 px-[30px] text-[17px]">
              <Rocket className="size-6" aria-hidden="true" />
              {h.startProjectBtn}
              <ArrowRight className="size-5" strokeWidth={2.4} aria-hidden="true" />
            </button>
            <a href={FEATURES.portfolio ? '#portfolio' : '#services'} className="btn-night h-[60px] gap-3.5 px-[25px] text-[17px]">
              <Play className="size-[22px] fill-aqua-400 text-aqua-400" aria-hidden="true" />
              {FEATURES.portfolio ? h.exploreWorkBtn : h.exploreServicesBtn}
            </a>
          </div>
        </div>
      </div>

      {/* trust strip */}
      <div className="container-page relative z-10 mt-12 lg:mt-[60px]">
        <ul className="glass-night mx-auto grid max-w-[1167px] grid-cols-1 gap-y-3 rounded-2xl py-4 sm:grid-cols-2 lg:grid-cols-4 lg:py-[14px]">
          {t.trust.map((item, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <li key={item.title} className="relative flex items-center gap-5 px-5 lg:pl-[27px]">
                {i > 0 && <span className="absolute top-1/2 left-0 hidden h-[46px] w-px -translate-y-1/2 bg-white/16 lg:block" aria-hidden="true" />}
                <span className="grid size-16 shrink-0 place-items-center rounded-full border border-aqua-400/35 bg-[linear-gradient(180deg,#123850,#0a2236)] text-aqua-400 shadow-[0_0_14px_rgb(46_230_214/0.25)]">
                  <Icon className="size-[30px]" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold text-white">{item.title}</span>
                  <span className="mt-1 block text-[13.5px] text-white/80">{item.sub}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
