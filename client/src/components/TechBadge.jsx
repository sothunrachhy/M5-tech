import { Component, FileSpreadsheet, FileText, ShieldCheck, Webhook } from 'lucide-react';
import {
  siAndroidstudio, siExpress, siFigma, siFlutter, siFramer, siJsonwebtokens, siLetsencrypt, siNginx,
  siNodedotjs, siPm2, siPostgresql, siReact, siTailwindcss, siUbuntu, siVite, siZod,
} from 'simple-icons';

// Brand logos (Simple Icons, CC0). `color` overrides brand colours that would vanish on navy.
const BRANDS = [
  [/react/i, siReact],
  [/vite/i, siVite],
  [/tailwind/i, siTailwindcss],
  [/node\.js/i, siNodedotjs],
  [/express/i, siExpress, '#e5e7eb'],
  [/flutter/i, siFlutter, '#47c5fb'],
  [/android/i, siAndroidstudio],
  [/figma/i, siFigma],
  [/framer/i, siFramer, '#4d8dff'],
  [/jwt/i, siJsonwebtokens, '#fb015b'],
  [/let'?s encrypt/i, siLetsencrypt, '#f8a027'],
  [/nginx/i, siNginx, '#22c55e'],
  [/pm2/i, siPm2, '#a78bfa'],
  [/postgres/i, siPostgresql, '#6b9bff'],
  [/ubuntu/i, siUbuntu],
  [/zod/i, siZod],
];

// Tools without a brand logo: a matching icon from the site's icon set.
const GENERIC = [
  [/excel/i, FileSpreadsheet, '#22c55e'],
  [/pdf/i, FileText, '#f87171'],
  [/rest api/i, Webhook, '#2ee6d6'],
  [/design system/i, Component, '#f472b6'],
  [/ufw|security/i, ShieldCheck, '#fbbf24'],
];

function lookup(name) {
  for (const [re, icon, color] of BRANDS) {
    if (re.test(name)) return { path: icon.path, color: color ?? `#${icon.hex}` };
  }
  for (const [re, Icon, color] of GENERIC) {
    if (re.test(name)) return { Icon, color };
  }
  return { Icon: Webhook, color: '#2ee6d6' };
}

/**
 * Tech stack chip with a glossy 3D logo tile that gently tilts (and spins when its card is hovered).
 * `index` staggers the motion so neighbouring tiles never move in step.
 */
export default function TechBadge({ name, index = 0 }) {
  const { path, Icon, color } = lookup(name);
  return (
    <span className="tech-chip" style={{ '--c': color }}>
      <span className="tech-cube" style={{ '--delay': `${(-index * 0.7).toFixed(1)}s` }} aria-hidden="true">
        {path ? (
          <svg viewBox="0 0 24 24" className="tech-logo">
            <path d={path} fill="currentColor" />
          </svg>
        ) : (
          <Icon className="tech-logo" strokeWidth={2.2} />
        )}
      </span>
      {name}
    </span>
  );
}
