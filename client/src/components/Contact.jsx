import { ArrowUpRight, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import InquiryForm from './InquiryForm.jsx';
import { Reveal, SectionTitle, TelegramIcon } from './ui.jsx';

function Channel({ href, icon: Icon, label, value, action, external, featured = false }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        featured
          ? 'border-aqua-400/45 bg-aqua-400/[0.08] shadow-[0_0_24px_rgb(46_230_214/0.12)] hover:border-aqua-400/80'
          : 'border-white/10 bg-white/[0.04] hover:border-aqua-400/45 hover:bg-white/[0.07]'
      }`}
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl ${
          featured ? 'bg-[#229ED9] text-white shadow-[0_8px_20px_-6px_rgb(34_158_217/0.7)]' : 'border border-aqua-400/30 bg-aqua-400/10 text-aqua-400'
        }`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-white/55">{label}</span>
        <span className="block truncate font-semibold text-white">{value}</span>
      </span>
      <span className="hidden text-xs font-bold text-aqua-300 sm:inline xl:hidden 2xl:inline">{action}</span>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-aqua-400 transition group-hover:bg-aqua-400 group-hover:text-night-ink">
        <ArrowUpRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
      </span>
    </a>
  );
}

export default function Contact({ contact, prefill }) {
  const { t } = useI18n();
  const c = t.contact;

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden py-20 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots-night absolute top-24 left-4 h-[136px] w-[110px] opacity-60" />
        <div className="bg-dots-night absolute top-24 right-4 h-[136px] w-[110px] opacity-60" />
      </div>

      <div className="container-page">
        <SectionTitle id="contact-title" tone="dark" badge={t.inquiry.badge} headline={t.inquiry.headline} lead={t.inquiry.subheadline} />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          <Reveal>
            <InquiryForm contact={contact} prefill={prefill} />
          </Reveal>

          <Reveal delay={100} className="space-y-3.5 lg:sticky lg:top-32 lg:self-start">
            <div className="pb-1">
              <p className="text-lg font-bold text-white">{t.form.channelsTitle}</p>
              <p className="mt-1 text-sm text-white/60">{t.form.channelsSub}</p>
            </div>
            {contact.telegramUrl && (
              <Channel href={contact.telegramUrl} external featured icon={TelegramIcon} label={c.fastestResponse} value={contact.telegram} action={c.openTelegram} />
            )}
            {contact.email && <Channel href={`mailto:${contact.email}`} icon={Mail} label={c.officialInquiries} value={contact.email} action={c.sendEmail} />}
            {contact.phone && (
              <Channel href={`tel:${contact.phone.replace(/\s+/g, '')}`} icon={Phone} label={c.directCall} value={contact.phone} action={c.callUs} />
            )}
            {contact.facebookUrl && (
              <Channel
                href={contact.facebookUrl}
                external
                icon={Facebook}
                label={c.facebookPage}
                value={contact.facebookUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
                action="Facebook"
              />
            )}
            {contact.location && (
              <div className="relative isolate overflow-hidden rounded-2xl border border-aqua-400/25 p-5">
                <img
                  src="/images/angkor-neon.jpg"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 -z-10 size-full object-cover object-[60%_40%] opacity-70"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_19_31/0.95)_30%,rgb(5_19_31/0.45))]" />
                <span className="flex items-center gap-4">
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-aqua-400 text-night-ink shadow-[0_0_22px_rgb(46_230_214/0.5)]">
                    <MapPin className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-white/60">{c.headquarters}</span>
                    <span className="block font-semibold text-white">{contact.location}</span>
                  </span>
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
