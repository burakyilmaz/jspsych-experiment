// src/utils/startup.ts

import i18next from "i18next";
import { initJsPsych } from "jspsych";

import {
  hasGlobalErrorOccurred,
  registerGlobalErrorBoundary,
} from "../errors/globalErrorBoundary";
import { StartupConfig } from "../types/interfaces";
import { Language } from "../types/enums"; // Enum kullanımı eklendi

/**
 * Deneyin teknik temelini (jsPsych, i18n, Hata Yönetimi, UI) kuran ana fonksiyondur.
 */
export async function setupExperiment({
  trResources,
  deResources,
}: StartupConfig) {
  silenceConsoleInProduction();
  registerGlobalErrorBoundary();

  await i18next.init({
    lng: Language.TR,
    resources: {
      [Language.TR]: { translation: trResources },
      [Language.DE]: { translation: deResources },
    },
    fallbackLng: Language.TR,
    interpolation: { escapeValue: false },
  });

  let root = document.getElementById("jspsych-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "jspsych-root";
    document.body.appendChild(root);
  }

  setupDarkModeUI();

  const jsPsych = initJsPsych({
    display_element: root,
    clear_html_on_finish: true,
    on_finish: () => {
      jsPsych.data.addProperties({
        fatal_error: hasGlobalErrorOccurred(),
      });
    },
  });

  const urlParams = new URLSearchParams(window.location.search);

  jsPsych.data.addProperties({
    url_parameters: Object.fromEntries(urlParams),
    start_time: new Date().toISOString(),
  });

  return { jsPsych };
}

function setupDarkModeUI() {
  const THEME_KEY = "theme";

  const applyTheme = (isDark: boolean) => {
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.textContent = isDark ? "☀️" : "🌙";
  };

  let existing = document.getElementById("dark-mode-navbar");
  if (existing) existing.remove();

  const navbar = document.createElement("div");
  navbar.id = "dark-mode-navbar";

  const button = document.createElement("button");
  button.id = "theme-toggle-btn";
  button.className = "theme-toggle-btn";
  button.onclick = () =>
    applyTheme(!document.body.classList.contains("dark-mode"));

  navbar.appendChild(button);
  document.body.appendChild(navbar);

  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(savedTheme === "dark" || (!savedTheme && prefersDark));
}

function silenceConsoleInProduction() {
  if (process.env.NODE_ENV === "production") {
    console.error = () => {};
    console.warn = () => {};
    console.log = () => {};
  }
}
