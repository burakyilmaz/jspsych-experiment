export const ALLOWED_LANGUAGES = ["tr", "de"] as const;
export type Lang = (typeof ALLOWED_LANGUAGES)[number];

function isAllowedLang(lang: string | null): lang is Lang {
  return !!lang && ALLOWED_LANGUAGES.includes(lang as Lang);
}

function isProduction(): boolean {
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

export function languageMiddleware(): Lang {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get("lang");

  const prod = isProduction();

  // 1️⃣ Valid lang → OK
  if (isAllowedLang(queryLang)) {
    return queryLang;
  }

  // 2️⃣ Production → HARD FAIL (boundary yakalayacak)
  if (prod) {
    throw new Error("Invalid or missing language parameter");
  }

  // 3️⃣ Development fallback
  const fallbackLang: Lang = "tr";

  params.set("lang", fallbackLang);
  window.location.replace(`${window.location.pathname}?${params.toString()}`);

  return fallbackLang; // TS için
}
