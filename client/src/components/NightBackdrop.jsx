/**
 * Moving night background shared by every section from Services to Contact.
 *
 * One viewport-sized layer pinned with `position: sticky`, so it follows the reader down
 * the page: the motion is always on screen, yet only one screen's worth of effects is ever
 * painted. Colour comes from radial/conic gradients (no filter blur) in the brand teal plus
 * electric blue and violet. Motion stops for visitors who ask for reduced motion
 * (global rule in index.css).
 */

const TEAL = '46 230 214';
const BLUE = '61 142 255';
const VIOLET = '139 92 246';
const CYAN = '0 212 255';
const SPECK_COLORS = [TEAL, TEAL, CYAN, BLUE, VIOLET];

// Deterministic pseudo-random values, so every render and reload looks the same.
const rand = (i, n) => (Math.sin((i + 1) * n) + 1) / 2;

const SPECKS = Array.from({ length: 46 }, (_, i) => ({
  left: `${(rand(i, 12.9898) * 100).toFixed(2)}%`,
  bottom: `${(rand(i, 78.233) * 50 - 15).toFixed(2)}%`,
  size: rand(i, 3.71) > 0.75 ? 4 : rand(i, 4.2) > 0.4 ? 3 : 2,
  d: `${(7 + rand(i, 5.13) * 9).toFixed(1)}s`,
  delay: `${(-rand(i, 9.41) * 16).toFixed(1)}s`,
  x: `${((rand(i, 2.17) - 0.5) * 140).toFixed(0)}px`,
  o: (0.45 + rand(i, 6.6) * 0.55).toFixed(2),
  rgb: SPECK_COLORS[i % SPECK_COLORS.length],
}));

const ORBS = [
  { left: '8%', top: '22%', size: 10, rgb: TEAL, d: '6s', delay: '0s', x: '26px' },
  { left: '88%', top: '18%', size: 8, rgb: VIOLET, d: '8s', delay: '-2s', x: '-30px' },
  { left: '72%', top: '64%', size: 12, rgb: BLUE, d: '7s', delay: '-4s', x: '18px' },
  { left: '18%', top: '78%', size: 9, rgb: CYAN, d: '9s', delay: '-1s', x: '-22px' },
  { left: '50%', top: '12%', size: 7, rgb: TEAL, d: '6.5s', delay: '-3s', x: '30px' },
  { left: '34%', top: '52%', size: 6, rgb: VIOLET, d: '7.5s', delay: '-5s', x: '24px' },
];

const BEAMS = [
  { top: '24%', w: '45vw', rgb: TEAL, d: '8s', delay: '0s', a: '-24deg' },
  { top: '58%', w: '38vw', rgb: VIOLET, d: '11s', delay: '-4s', a: '-18deg' },
  { top: '80%', w: '34vw', rgb: BLUE, d: '9s', delay: '-6s', a: '-28deg' },
  { top: '40%', w: '30vw', rgb: CYAN, d: '13s', delay: '-9s', a: '-12deg' },
];

const glow = (rgb, a, mid) => `radial-gradient(closest-side, rgb(${rgb} / ${a}), rgb(${rgb} / ${mid}) 55%, transparent)`;

/** Flowing light waves along the bottom of the screen. */
function Waves() {
  return (
    <svg viewBox="0 0 1600 300" preserveAspectRatio="none" fill="none" className="absolute inset-x-0 bottom-[6%] h-[34vh] w-full animate-wave-sway">
      <defs>
        <linearGradient id="nb-wave-1" x1="0" x2="1">
          <stop offset="0" stopColor="#2ee6d6" stopOpacity="0" />
          <stop offset="0.3" stopColor="#2ee6d6" />
          <stop offset="0.7" stopColor="#3d8eff" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nb-wave-2" x1="0" x2="1">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="0.4" stopColor="#8b5cf6" />
          <stop offset="0.8" stopColor="#00d4ff" />
          <stop offset="1" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* wide faint strokes fake the glow (a CSS filter here would repaint every frame) */}
      <g strokeLinecap="round" strokeOpacity="0.14">
        <path d="M0 210C220 150 420 250 640 190S1060 90 1280 150 1520 230 1600 200" stroke="url(#nb-wave-1)" strokeWidth="10" />
        <path d="M0 250C260 200 460 280 700 230S1100 150 1340 200 1540 260 1600 240" stroke="url(#nb-wave-2)" strokeWidth="8" />
      </g>
      <g>
        <path d="M0 210C220 150 420 250 640 190S1060 90 1280 150 1520 230 1600 200" stroke="url(#nb-wave-1)" strokeOpacity="0.25" strokeWidth="1.5" />
        <path
          d="M0 210C220 150 420 250 640 190S1060 90 1280 150 1520 230 1600 200"
          stroke="url(#nb-wave-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="160 240"
          className="animate-wave-flow"
          style={{ '--d': '5s' }}
        />
        <path d="M0 250C260 200 460 280 700 230S1100 150 1340 200 1540 260 1600 240" stroke="url(#nb-wave-2)" strokeOpacity="0.2" strokeWidth="1.2" />
        <path
          d="M0 250C260 200 460 280 700 230S1100 150 1340 200 1540 260 1600 240"
          stroke="url(#nb-wave-2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="90 310"
          className="animate-wave-flow"
          style={{ '--d': '7s', animationDelay: '-2s' }}
        />
        <path
          d="M0 170C240 120 470 210 720 160S1120 70 1360 120 1550 190 1600 170"
          stroke="url(#nb-wave-2)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="60 340"
          className="animate-wave-flow"
          style={{ '--d': '9s', animationDelay: '-4s' }}
        />
      </g>
    </svg>
  );
}

export default function NightBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none sticky top-0 -z-10 -mb-[100vh] h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05131f,#081d31_50%,#05131f)]" />

      {/* slowly turning colour wash */}
      <div className="absolute top-1/2 left-1/2 size-[160vmax] -translate-x-1/2 -translate-y-1/2">
        <div className="size-full animate-spin-slow bg-[conic-gradient(from_0deg,rgb(46_230_214/0.10),rgb(61_142_255/0.10),rgb(139_92_246/0.11),rgb(0_212_255/0.08),rgb(46_230_214/0.10))] [mask-image:radial-gradient(closest-side,#000,transparent)]" />
      </div>

      {/* drifting aurora glows */}
      <div className="absolute -top-[25%] -left-[20%] h-[85vh] w-[75vw] animate-aurora-a rounded-full" style={{ background: glow(TEAL, 0.32, 0.1) }} />
      <div className="absolute top-[25%] -right-[25%] h-[90vh] w-[80vw] animate-aurora-b rounded-full" style={{ background: glow(BLUE, 0.3, 0.09) }} />
      <div className="absolute -bottom-[35%] left-[10%] h-[80vh] w-[70vw] animate-aurora-c rounded-full" style={{ background: glow(VIOLET, 0.26, 0.08) }} />
      <div className="absolute top-[10%] left-[35%] h-[55vh] w-[45vw] animate-aurora-d rounded-full" style={{ background: glow(CYAN, 0.18, 0.05) }} />

      {/* drifting engineering grid */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_25%,transparent_80%)]">
        <div className="bg-grid-dark absolute -inset-8 animate-grid-drift" />
      </div>

      {/* spinning ring of light behind the centre */}
      <div className="absolute top-1/2 left-1/2 size-[70vmin] -translate-x-1/2 -translate-y-1/2 opacity-60">
        <div className="size-full animate-spin-rev rounded-full bg-[conic-gradient(from_90deg,transparent_0deg,rgb(46_230_214/0.35)_40deg,transparent_90deg,transparent_180deg,rgb(139_92_246/0.3)_220deg,transparent_270deg)] [mask-image:radial-gradient(closest-side,transparent_96%,#000_97%,transparent_100%)]" />
      </div>

      <Waves />

      {/* light sweeps */}
      {BEAMS.map((b, i) => (
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

      {/* pulsing glow orbs */}
      {ORBS.map((o, i) => (
        <span
          key={i}
          className="absolute animate-orb rounded-full"
          style={{
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            background: `rgb(${o.rgb})`,
            boxShadow: `0 0 ${o.size * 2}px rgb(${o.rgb} / 0.9), 0 0 ${o.size * 5}px rgb(${o.rgb} / 0.45)`,
            animationDelay: o.delay,
            '--d': o.d,
            '--x': o.x,
          }}
        />
      ))}

      {/* rising light specks */}
      {SPECKS.map((s, i) => (
        <span
          key={i}
          className="absolute animate-speck rounded-full"
          style={{
            left: s.left,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            background: `rgb(${s.rgb})`,
            boxShadow: `0 0 ${s.size * 3}px rgb(${s.rgb} / 0.9)`,
            animationDelay: s.delay,
            '--d': s.d,
            '--x': s.x,
            '--o': s.o,
          }}
        />
      ))}

      {/* soft vignette so edges stay calm behind content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(3_12_20/0.5))]" />
    </div>
  );
}
