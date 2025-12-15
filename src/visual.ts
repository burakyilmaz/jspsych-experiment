/**
 * @title Visual Test Experiment
 * @description Tez çalışması için geliştirilen görsel deney uygulaması
 * @version 0.1.0
 * @assets assets/
 */

import "../styles/main.scss";
import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";

// -----------------------------------------------------------------------------
// i18n JSON (ROOT ALIAS)
// -----------------------------------------------------------------------------

import trTranslations from "/src/locales/tr/translation.json";
import deTranslations from "/src/locales/de/translation.json";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

import { RunOptions } from "src/types/interfaces";

// -----------------------------------------------------------------------------
// Runner
// -----------------------------------------------------------------------------

export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}: RunOptions) {
  await i18next.init({
    lng: "tr",
    resources: {
      tr: { translation: trTranslations },
      de: { translation: deTranslations },
    },
  });

  const jsPsych = initJsPsych();
  const timeline: any[] = [];

  // ---------------------------------------------------------------------------
  // Preload
  // ---------------------------------------------------------------------------

  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // ---------------------------------------------------------------------------
  // Welcome
  // ---------------------------------------------------------------------------

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>${i18next.t("welcome")}</p>`,
  });

  // TODO: Implement visual test logic here

  await jsPsych.run(timeline);
  return jsPsych;
}

// -----------------------------------------------------------------------------
// Manual run (browser only)
// -----------------------------------------------------------------------------

if (typeof window !== "undefined" && !(window as any).jsPsychBuilder) {
  const manualAssetPaths = { images: [], audio: [], video: [] };

  run({
    assetPaths: manualAssetPaths,
    input: {},
    environment: "production",
    title: "JsPsych Experiment",
    version: "0.1.0",
  });
}
