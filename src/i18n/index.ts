import { en } from './locales/en';
import { ru } from './locales/ru';
import { uk } from './locales/uk';

export const locales = {
  en,
  ru,
  uk,
} as const;

export type Locale = keyof typeof locales;
export type TranslationKeys = typeof en;

export const defaultLocale: Locale = 'en';

export function getTranslations(locale: Locale = defaultLocale) {
  return locales[locale] || locales[defaultLocale];
}
