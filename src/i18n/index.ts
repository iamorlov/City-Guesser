import { en } from './locales/en';
import { ru } from './locales/ru';

export const locales = {
  en,
  ru,
} as const;

export type Locale = keyof typeof locales;
export type TranslationKeys = typeof en;

export const defaultLocale: Locale = 'en';

export function getTranslations(locale: Locale = defaultLocale) {
  return locales[locale] || locales[defaultLocale];
}
