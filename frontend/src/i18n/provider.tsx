"use client";

import React from "react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { initI18n } from "./config";
import {
  AppLocale,
  getDefaultLocale,
  getDirection,
  isSupportedLocale,
} from "./utils";

const STORAGE_KEY = "stellarinsure-locale";

function getStorage() {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage;
  if (!storage || typeof storage.getItem !== "function") return null;
  return storage;
}

type LanguageContextValue = {
  locale: AppLocale;
  localeStatus: string;
  setLocale: (locale: AppLocale) => void;
};

const i18n = initI18n();

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    const storage = getStorage();
    if (!storage) return getDefaultLocale();

    const storedLocale = storage.getItem(STORAGE_KEY);
    return isSupportedLocale(storedLocale) ? storedLocale : getDefaultLocale();
  });
  const [localeStatus, setLocaleStatus] = useState("");

  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    getStorage()?.setItem(STORAGE_KEY, locale);
    const nextStatus =
      locale === "ar" ? "تم تحديث اللغة إلى العربية." : "Language updated to English.";
    setLocaleStatus(nextStatus);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      localeStatus,
      setLocale: (nextLocale: AppLocale) => setLocaleState(nextLocale),
    }),
    [locale, localeStatus],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

export function useAppTranslation() {
  const language = useLanguage();
  const { t } = useTranslation();

  return {
    ...language,
    t,
  };
}
