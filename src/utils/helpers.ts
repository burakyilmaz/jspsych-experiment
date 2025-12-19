import i18next from "i18next";

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function currentLang(): "tr" | "de" | null {
  const lang = i18next.language?.split("-")[0]; // örn: "tr-TR" -> "tr"
  if (lang === "tr" || lang === "de") {
    return lang;
  }
  return null; // Geçersiz veya boşsa null döner
}
