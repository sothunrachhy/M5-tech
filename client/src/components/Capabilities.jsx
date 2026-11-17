import { useI18n } from '../i18n/LanguageContext.jsx';
import { ImageBanner, Reveal, SectionTitle } from './ui.jsx';

// Order matches t.capabilities.items: Custom, Automation, Scalable, Support.
const IMAGES = ['/images/icon-camera.jpg', '/images/icon-automation.jpg', '/images/icon-growth.jpg', '/images/icon-security.jpg'];

export default function Capabilities() {
  const { t } = useI18n();
  const c = t.capabilities;

  return (
    <section aria-labelledby="capabilities-title" className="relative pt-10 pb-24 lg:pb-40">
      <div className="container-page">
        <SectionTitle id="capabilities-title" tone="dark" badge={c.badge} headline={c.headline} lead={c.subheadline} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={i * 80}
              className="group glass-night relative flex flex-col overflow-hidden rounded-[22px] transition hover:-translate-y-1 hover:border-aqua-400/50 hover:shadow-[0_18px_40px_rgb(0_0_0/0.45),0_0_24px_rgb(46_230_214/0.18)]"
            >
              <ImageBanner dark src={IMAGES[i % IMAGES.length]} className="h-44 border-b border-aqua-400/15" />
              <div className="flex flex-1 flex-col p-6">
                <span className="text-[11px] font-bold tracking-wider text-aqua-400 uppercase">{item.tag}</span>
                <h3 className="mt-1.5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.shortDesc}</p>
                <p className="mt-3 border-t border-white/10 pt-3 text-[13px] leading-relaxed text-white/60">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
