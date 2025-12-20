// src/utils/helpers.ts
import i18next from "i18next";
import { Language } from "../types/enums"; // Enum'ı içeri aktar

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function currentLang(): Language | null {
  const lang = i18next.language?.split("-")[0];
  // Enum değerleriyle tip kontrolü yapıyoruz
  if (lang === Language.TR || lang === Language.DE) {
    return lang as Language;
  }
  return null;
}
