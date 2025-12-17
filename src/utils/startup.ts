import i18next from "i18next";
import { initJsPsych } from "jspsych";

interface StartupConfig {
  trResources: any;
  deResources: any;
}

export async function setupExperiment({
  trResources,
  deResources,
}: StartupConfig) {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang");
  const supportedLangs = ["tr", "de"];
  const currentLang =
    urlLang && supportedLangs.includes(urlLang) ? urlLang : "tr";

  await i18next.init({
    lng: currentLang,
    resources: {
      tr: { translation: trResources },
      de: { translation: deResources },
    },
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
  });

  jsPsych.data.addProperties({
    language: currentLang,
    url_parameters: Object.fromEntries(urlParams),
  });

  return { jsPsych, currentLang };
}

function setupDarkModeUI() {
  const THEME_KEY = "theme";

  const applyTheme = (isDark: boolean) => {
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    button.textContent = isDark ? "☀️" : "🌙";
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
