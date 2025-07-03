"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Locale, getTranslations, defaultLocale } from './index';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getTranslations>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const t = getTranslations(locale);

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('geo-lang') as Locale;
    if (saved && ['en', 'ru', 'uk'].includes(saved)) {
      setLocale(saved);
    }
  }, []);

  // Save to localStorage whenever locale changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('geo-lang', locale);
    }
  }, [locale, isHydrated]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
