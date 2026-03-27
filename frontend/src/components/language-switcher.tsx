"use client";

import React from "react";
import { getDirection } from "@/i18n/utils";
import { useAppTranslation } from "@/i18n/provider";

export function LanguageSwitcher() {
  const { locale, localeStatus, setLocale, t } = useAppTranslation();

  return (
    <div aria-label={t("languageSelector.label")}>
      <div className="locale-switcher" role="group" aria-label={t("languageSelector.group")}>
        <button
          aria-pressed={locale === "en"}
          lang="en"
          onClick={() => setLocale("en")}
          type="button"
        >
          {t("languageSelector.english")}
        </button>
        <button
          aria-pressed={locale === "ar"}
          lang="ar"
          onClick={() => setLocale("ar")}
          type="button"
        >
          {t("languageSelector.arabic")}
        </button>
      </div>
      <p
        aria-live="polite"
        className="language-status"
        dir={getDirection(locale)}
        role="status"
      >
        {localeStatus}
      </p>
    </div>
  );
}
