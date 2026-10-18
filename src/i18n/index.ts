import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

export const LANGUAGES = ['pt-BR', 'en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

export const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
} as const;

export function deviceLanguage(): Language {
  for (const locale of getLocales()) {
    if (locale.languageCode === 'pt') return 'pt-BR';
    if (locale.languageCode === 'en') return 'en';
    if (locale.languageCode === 'es') return 'es';
  }
  return 'pt-BR';
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
});

export function applyLanguage(language: Language | null) {
  const target = language ?? deviceLanguage();
  if (i18n.language !== target) void i18n.changeLanguage(target);
}

export default i18n;
