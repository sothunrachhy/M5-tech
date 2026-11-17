import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.json';
import km from './km.json';
import { extra } from './extra.js';

// Merge per section so extra strings never wipe out a whole section of the base file.
const merge = (base, add) =>
  Object.fromEntries(
    [...new Set([...Object.keys(base), ...Object.keys(add)])].map((k) => [
      k,
      Array.isArray(add[k]) || typeof add[k] !== 'object' ? (add[k] ?? base[k]) : { ...base[k], ...add[k] },
    ]),
  );
const dictionaries = { en: merge(en, extra.en), km: merge(km, extra.km) };
const STORAGE_KEY = 'm5-lang';

function initialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'en' || fromUrl === 'km') return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'km') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('km') ? 'km' : 'en';
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => {
    const t = dictionaries[lang];
    /** Replace {name} placeholders. */
    const fmt = (str, vars = {}) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
    /** Translate a form option value (values stay English in the DB). */
    const opt = (value) => t.form.options[value] ?? value;
    return { lang, setLang, t, fmt, opt };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}
