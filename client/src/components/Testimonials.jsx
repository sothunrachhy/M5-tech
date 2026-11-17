import { Quote, Star } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { Reveal, SectionTitle } from './ui.jsx';

/**
 * Real client testimonials from Postgres (server/db/content/testimonials.json).
 * Renders nothing until at least one exists — no placeholder reviews.
 */
export default function Testimonials({ items }) {
  const { t } = useI18n();
  if (!items?.length) return null;
  const s = t.testimonials;

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="relative py-20 lg:py-28">
      <div className="container-page">
        <SectionTitle id="testimonials-title" tone="dark" badge={s.badge} headline={s.headline} lead={s.lead} />
        <ul className={`mt-14 grid gap-6 ${items.length > 1 ? 'md:grid-cols-2' : ''} ${items.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {items.map((item, i) => (
            <Reveal as="li" key={item.slug} delay={(i % 3) * 80} className="card-night flex flex-col rounded-[22px] p-7">
              <Quote className="size-8 text-aqua-400/60" aria-hidden="true" />
              {item.rating > 0 && (
                <div className="mt-4 flex gap-0.5" aria-label={`${item.rating} / 5`}>
                  {Array.from({ length: 5 }, (_, n) => (
                    <Star
                      key={n}
                      className={`size-4 ${n < item.rating ? 'fill-gold text-gold' : 'text-white/15'}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/80">“{item.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="size-11 rounded-full object-cover ring-2 ring-aqua-400/40" />
                ) : (
                  <span className="grid size-11 place-items-center rounded-full bg-gradient-to-b from-[#5cf5e8] to-aqua-500 font-bold text-night-ink">
                    {item.author.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-bold text-white">{item.author}</span>
                  <span className="block truncate text-[13px] text-white/55">
                    {item.role} · {item.company}
                  </span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
