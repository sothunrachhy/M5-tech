import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { TelegramIcon } from './ui.jsx';

/** Telegram shortcut + back-to-top, shown after the hero. */
export default function FloatingActions({ contact }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 transition duration-300 sm:right-6 sm:bottom-6 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <a
        href="#home"
        aria-label={t.footer.backToTop}
        className="grid size-11 place-items-center rounded-full bg-white text-ink-900 shadow-lift ring-1 ring-brand-100 hover:text-brand-600"
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </a>
      {contact.telegramUrl && (
        <a
          href={contact.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#229ED9] py-3 pr-5 pl-4 text-sm font-bold text-white shadow-[0_12px_30px_-8px_rgb(34_158_217/0.7)] hover:bg-[#1b8dc3]"
        >
          <TelegramIcon className="size-5" />
          <span className="hidden sm:inline">{t.nav.directTelegram}</span>
        </a>
      )}
    </div>
  );
}
