import { useId } from 'react';

/** Smooth area sparkline. `points` are raw numbers; scaled to fit. */
export default function Sparkline({ points, color, className = '' }) {
  const gid = `spark-${useId().replace(/[^\w-]/g, '')}`;
  if (!points?.length) return null;

  const w = 160;
  const h = 60;
  const pad = 5;
  const min = Math.min(...points);
  const span = Math.max(...points) - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - pad - ((p - min) / span) * (h - pad * 2)]);
  const line = xy.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = xy[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, '');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
}
