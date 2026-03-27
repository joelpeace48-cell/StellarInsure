export const supportedLocales = ["en", "ar"] as const;

export type AppLocale = (typeof supportedLocales)[number];

const rtlLocales = new Set<AppLocale>(["ar"]);

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return supportedLocales.includes((value ?? "") as AppLocale);
}

export function getDefaultLocale(): AppLocale {
  const configured = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  return isSupportedLocale(configured) ? configured : "en";
}

export function getDirection(locale: AppLocale): "ltr" | "rtl" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}
