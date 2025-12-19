// src/utils/startup.ts

import i18next from "i18next";
import { initJsPsych } from "jspsych";

import {
  hasGlobalErrorOccurred,
  registerGlobalErrorBoundary,
} from "../errors/globalErrorBoundary";
import { languageMiddleware } from "../middleware/languageMiddleware";
import { StartupConfig } from "../types/interfaces";

export async function setupExperiment({
  trResources,
  deResources,
}: StartupConfig) {
  // 0️⃣ PROD CONSOLE SİLENCING
  silenceConsoleInProduction();

  // 1️⃣ GLOBAL ERROR BOUNDARY
  registerGlobalErrorBoundary();

  // 2️⃣ LANGUAGE MIDDLEWARE (TEK OTORİTE)
  const lang = languageMiddleware();

  // 3️⃣ i18next INIT
  await i18next.init({
    lng: lang,
    resources: {
      tr: { translation: trResources },
      de: { translation: deResources },
    },
    fallbackLng: false,
  });

  // 4️⃣ JsPsych Root Element
  let root = document.getElementById("jspsych-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "jspsych-root";
    document.body.appendChild(root);
  }

  // 5️⃣ Dark Mode UI
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

  // 7️⃣ Global Data Properties
  const urlParams = new URLSearchParams(window.location.search);

  jsPsych.data.addProperties({
    url_lang: lang, // middleware'den gelen, validate edilmiş değer
    url_parameters: Object.fromEntries(urlParams),
  });

  return { jsPsych };
}

/**
 * Tema yönetimi ve buton oluşturma
 */
function setupDarkModeUI() {
  const THEME_KEY = "theme";

  const applyTheme = (isDark: boolean) => {
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    if (button) button.textContent = isDark ? "☀️" : "🌙";
  };

  let existing = document.getElementById("dark-mode-navbar");
  if (existing) existing.remove();

  const navbar = document.createElement("div");
  navbar.id = "dark-mode-navbar";

  const button = document.createElement("button");
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
  }
}
