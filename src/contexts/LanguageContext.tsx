import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language } from '../types';
import { translations } from '../i18n/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('smartgrievance-language');
    return saved === 'ta' ? 'ta' : 'en';
  });

  const setLanguage = (next: Language) => {
    const target = next === 'ta' ? 'ta' : 'en';
    setLanguageState(target);
    localStorage.setItem('smartgrievance-language', target);
    document.documentElement.lang = target;
  };

  useEffect(() => {
    localStorage.setItem('smartgrievance-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (text: string, fallback?: string) => {
      if (!text) return '';
      if (language === 'ta') {
        return translations.ta[text] ?? fallback ?? translations.en[text] ?? text;
      }
      return translations.en[text] ?? fallback ?? text;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
