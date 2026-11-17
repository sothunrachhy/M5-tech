import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Briefcase, CheckCircle2, Cpu, Info, X } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import Sparkline from './Sparkline.jsx';
import { Reveal, SectionHeader, SectionState } from './ui.jsx';

const FILTERS = [
  { key: 'all', label: 'filterAll' },
  { key: 'Web Applications', label: 'filterWeb' },
  { key: 'Management Systems', label: 'filterManagement' },
  { key: 'Mobile Applications', label: 'filterMobile' },
];

const SYSTEM_TYPE = {
  'Web Applications': 'Web Application',
  'Management Systems': 'Management System',
  'Mobile Applications': 'Mobile Application',
};

// Product-mock art for each project card (UI chrome, intentionally English like real software).
const VISUALS = {
  'hospital-dash': {
    title: 'MCIMS • FEFO ENGINE',
    sub: 'FEFO Stock Allocation Engine',
    accent: '#38e1ff',
    stats: [['WARD OUT', '128 Vials'], ['EXPIRY ORDER', 'Active'], ['REQUISITION', 'Approved']],
    spark: [12, 18, 15, 24, 22, 30, 34, 31, 42, 50],
  },
  'hr-dash': {
    title: 'HR & STAFF PORTAL',
    sub: 'Staff Hierarchy & Leave Ledger',
    accent: '#a78bfa',
    stats: [['DEPARTMENTS', '12 Units'], ['LEAVE FLOW', '2-Tier'], ['ATTENDANCE', 'Synced']],
    spark: [20, 22, 21, 26, 25, 30, 29, 33, 35, 38],
  },
  'qr-dash': {
    title: 'TIME-ROTATING QR SCANNER',
    sub: 'Anti-Proxy Real-time Attendance',
    accent: '#34d399',
    stats: [['CYCLE TIME', '8s Refresh'], ['VERIFIED', 'Real-time'], ['CAMERA SYNC', '<500ms']],
    qr: true,
  },
  'inventory-dash': {
    title: 'STOCK LEDGER & POS',
    sub: 'Double-Entry Multi-Branch Warehouse',
    accent: '#fbbf24',
    stats: [['BALANCE', 'Guaranteed'], ['BARCODES', 'Supported'], ['TRANSFERS', 'Logged']],
    spark: [30, 26, 34, 31, 38, 36, 44, 41, 47, 52],
  },
};

function QrGlyph({ color }) {
  // deterministic pseudo-QR pattern
  const cells = [];
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < 9; x++) {
      const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      if (finder || (x * 7 + y * 5 + x * y) % 3 === 0) cells.push([x, y]);
    }
  return (
    <svg viewBox="0 0 9 9" className="size-16 rounded-md bg-white p-1" aria-hidden="true">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color === '#34d399' ? '#0a1633' : color} />
      ))}
    </svg>
  );
}

function ProjectVisual({ type, large = false }) {
  const v = VISUALS[type] ?? VISUALS['hospital-dash'];
  return (
    <div
      className={`relative isolate flex flex-col justify-between overflow-hidden bg-ink-900 p-5 text-white ${large ? 'h-56 sm:h-64' : 'h-52'}`}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-700" />
      <div className="bg-grid-dark absolute inset-0 -z-10" />
      <div className="absolute -top-10 -right-10 -z-10 size-40 rounded-full blur-3xl" style={{ background: `${v.accent}40` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest" style={{ color: v.accent }}>
            {v.title}
          </p>
          <p className="mt-1 text-sm font-bold">{v.sub}</p>
        </div>
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full" style={{ background: v.accent }} />
        </span>
      </div>
      <div className="relative flex items-end justify-between gap-3">
        {v.qr ? <QrGlyph color={v.accent} /> : <Sparkline points={v.spark} color={v.accent} className="h-14 w-1/2" />}
      </div>
      <div className="relative grid grid-cols-3 gap-2">
        {v.stats.map(([k, val]) => (
          <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
            <p className="text-[8px] tracking-wider text-white/45">{k}</p>
            <p className="mt-0.5 text-xs font-bold">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDialog({ project, onClose, onBuildSimilar }) {
  const { t } = useI18n();
  const m = t.portfolioModal;
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll('button, a[href]');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="project-title">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className="relative flex max-h-[92vh] w-full max-w-3xl animate-fade-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="overflow-y-auto">
          <ProjectVisual type={project.visual} large />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="chip">{project.category}</span>
              <span className="chip bg-amber-50 text-amber-700 ring-amber-200">{project.badge}</span>
            </div>
            <h3 id="project-title" className="mt-3 text-2xl font-extrabold text-ink-900">
              {project.title}
            </h3>
            <p className="mt-2 text-slate-ink">{project.summary}</p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {project.metrics.map((x) => (
                <div key={x.label} className="rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
                  <dt className="text-xs font-semibold text-slate-ink">{x.label}</dt>
                  <dd className="mt-1 font-bold text-brand-700">{x.value}</dd>
                </div>
              ))}
            </dl>

            <h4 className="mt-8 flex items-center gap-2 font-bold text-ink-900">
              <Info className="size-4.5 text-brand-600" aria-hidden="true" /> {m.overview}
            </h4>
            <p className="mt-2 leading-relaxed text-slate-ink">{project.description}</p>

            <h4 className="mt-8 font-bold text-ink-900">{m.capabilities}</h4>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-ink-800">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>

            <h4 className="mt-8 flex items-center gap-2 font-bold text-ink-900">
              <Cpu className="size-4.5 text-brand-600" aria-hidden="true" /> {m.architecture}
            </h4>
            <dl className="mt-3 divide-y divide-brand-100 rounded-2xl border border-brand-100">
              {Object.entries(project.architecture).map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[130px_1fr]">
                  <dt className="font-mono text-xs tracking-wide text-slate-ink uppercase">{k}</dt>
                  <dd className="font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            <h4 className="mt-8 font-bold text-ink-900">{m.tech}</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.techStack.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-brand-100 bg-brand-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm font-semibold text-ink-800">{m.similar}</p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBuildSimilar({
                systemType: SYSTEM_TYPE[project.categories[0]] ?? 'Other',
                projectName: project.title,
              });
            }}
            className="btn-primary shrink-0"
          >
            {m.buildSimilar}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio({ items, loading, error, retry, onBuildSimilar }) {
  const { t } = useI18n();
  const p = t.portfolio;
  const [filter, setFilter] = useState('all');
  const [openSlug, setOpenSlug] = useState(null);
  const close = useCallback(() => setOpenSlug(null), []);

  const visible = items?.filter((x) => filter === 'all' || x.categories.includes(filter)) ?? [];
  const open = items?.find((x) => x.slug === openSlug);

  return (
    <section id="portfolio" className="relative border-y border-brand-100 bg-white py-20 lg:py-28">
      <div className="container-page">
        <SectionHeader eyebrow={p.badge} icon={Briefcase} title={p.headline} lead={p.subheadline} />
        <p className="mt-4 text-center text-xs font-semibold text-slate-ink">{p.disclaimer}</p>

        <div className="mt-10 flex justify-center">
          <div role="group" aria-label={p.badge} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  filter === f.key ? 'bg-ink-900 text-white shadow-soft' : 'bg-brand-50 text-ink-800 hover:bg-brand-100'
                }`}
              >
                {p[f.label]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <SectionState loading={loading} error={error} retry={retry} skeleton={4} className="grid gap-6 md:grid-cols-2" />
          {items && visible.length === 0 && <p className="text-center text-slate-ink">{t.portfolioModal.empty}</p>}
          <ul className="grid gap-6 md:grid-cols-2">
            {visible.map((project, i) => (
              <Reveal as="li" key={project.slug} delay={(i % 2) * 80}>
                <button
                  type="button"
                  onClick={() => setOpenSlug(project.slug)}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="w-full overflow-hidden">
                    <div className="transition duration-500 group-hover:scale-[1.03]">
                      <ProjectVisual type={project.visual} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="chip">{project.category}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-ink-900">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-ink">{project.summary}</p>
                    <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-brand-100 pt-4">
                      {project.metrics.map((x) => (
                        <div key={x.label}>
                          <dt className="text-[11px] text-slate-ink">{x.label}</dt>
                          <dd className="mt-0.5 text-xs font-bold text-ink-900">{x.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
                      {p.viewDetailsBtn}
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      {open && <ProjectDialog project={open} onClose={close} onBuildSimilar={onBuildSimilar} />}
    </section>
  );
}
