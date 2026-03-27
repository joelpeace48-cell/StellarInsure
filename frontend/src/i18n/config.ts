import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./messages/ar";
import en from "./messages/en";
import { AppLocale, getDefaultLocale } from "./utils";

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

export function initI18n(locale: AppLocale = getDefaultLocale()) {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
  }

  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale);
  }

  return i18n;
}
