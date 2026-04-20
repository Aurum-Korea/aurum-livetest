// ═══════════════════════════════════════════════════════════════════════
// AURUM · LANGUAGE CONTEXT
// 
// Default: ko (Korean-first). Users can toggle to EN via nav toggle.
// Persisted to localStorage so choice sticks across sessions.
// 
// Usage in any page:
//   import { useLang } from '../lib/lang';
//   const { lang, setLang, t } = useLang();
//   <h1>{t('환영합니다', 'Welcome')}</h1>
// ═══════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from 'react';

const LangContext = createContext({ lang: 'ko', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'ko';
    const stored = localStorage.getItem('aurum_lang');
    return stored === 'en' || stored === 'ko' ? stored : 'ko';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurum_lang', lang);
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (next) => {
    if (next === 'ko' || next === 'en') setLangState(next);
  };

  // Translator helper: t('한국어', 'English')
  const t = (ko, en) => (lang === 'ko' ? ko : en);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
