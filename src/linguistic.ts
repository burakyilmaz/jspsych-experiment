/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması (i18n Entegreli)
 * @version 0.1.0
 * @assets assets/
 */

import "../styles/main.scss";
import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import { initJsPsych } from "jspsych";
import jsPsychPipe from "@jspsych-contrib/plugin-pipe";

// -----------------------------------------------------------------------------
// JSON & Static Data
// -----------------------------------------------------------------------------

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import linguisticData from "../assets/linguistic/data.json";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

import { RunOptions, SentenceData } from "src/types/interfaces";

// -----------------------------------------------------------------------------
// Experiment Constants
// -----------------------------------------------------------------------------

const ITEM_COUNT_LEARNING = 4;
const TEST_OLD_COUNT = 2;
const TEST_NEW_COUNT = 2;
const STUDY_SENTENCE_DELAY_MS = 2000;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// -----------------------------------------------------------------------------
// Main Runner
// -----------------------------------------------------------------------------

export async function run({ assetPaths }: RunOptions) {
  // ---------------------------------------------------------------------------
  // i18n Init
  // ---------------------------------------------------------------------------

  await i18next.init({
    lng: "tr",
    resources: {
      tr: { translation: trTranslations },
      de: { translation: deTranslations },
    },
  });

  // ---------------------------------------------------------------------------
  // jsPsych Root
  // ---------------------------------------------------------------------------

  let root = document.getElementById("jspsych-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "jspsych-root";
    document.body.appendChild(root);
  }

  const jsPsych = initJsPsych({
    display_element: root,
    clear_html_on_finish: true,
  });

  // ---------------------------------------------------------------------------
  // Base Trial (screen reset)
  // ---------------------------------------------------------------------------

  const clearScreen = () => {
    const el = jsPsych.getDisplayElement();
    if (el) el.innerHTML = "";
  };

  const baseTrial = {
    on_start: clearScreen,
  };

  const timeline: any[] = [];

  // ---------------------------------------------------------------------------
  // Preload
  // ---------------------------------------------------------------------------

  timeline.push({
    ...baseTrial,
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // ---------------------------------------------------------------------------
  // Welcome
  // ---------------------------------------------------------------------------

  timeline.push({
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `<p>${i18next.t("welcome")}</p>`,
    choices: [i18next.t("buttons.start")],
    data: { phase: "welcome" },
  });

  // ---------------------------------------------------------------------------
  // Data Preparation
  // ---------------------------------------------------------------------------

  const allStimuli = shuffleArray(linguisticData as SentenceData[]);
  const learningPhaseStimuli = allStimuli.slice(0, ITEM_COUNT_LEARNING);
  const unseenStimuli = allStimuli.slice(ITEM_COUNT_LEARNING);

  learningPhaseStimuli.forEach((item) => {
    item.shownVersion = Math.random() < 0.5 ? item.tr_option1 : item.tr_option2;
  });

  // ---------------------------------------------------------------------------
  // Study Phase – Intro
  // ---------------------------------------------------------------------------

  timeline.push({
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `<p>${i18next.t("intro.study_phase")}</p>`,
    choices: [i18next.t("buttons.continue")],
    data: { phase: "study_intro" },
  });

  // ---------------------------------------------------------------------------
  // Study Phase – Items
  // ---------------------------------------------------------------------------

  learningPhaseStimuli.forEach((item, index) => {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="sentence-container">
          <p class="study-sentence">
            ${item.tr_sentence.replace("...", item.shownVersion!)}
          </p>
        </div>
      `,
      choices: [i18next.t("buttons.next")],
      enable_button_after: STUDY_SENTENCE_DELAY_MS,
      data: {
        phase: "study",
        item_id: item.id,
        item_index: index,
        shown_form: item.shownVersion,
      },
    });
  });

  // ---------------------------------------------------------------------------
  // Test Phase – Intro
  // ---------------------------------------------------------------------------

  timeline.push({
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `<p>${i18next.t("intro.test_phase")}</p>`,
    choices: [i18next.t("buttons.start_test")],
    data: { phase: "test_intro" },
  });

  // ---------------------------------------------------------------------------
  // Test Phase – Balanced Selection
  // ---------------------------------------------------------------------------

  const testOldItems = shuffleArray(learningPhaseStimuli).slice(
    0,
    TEST_OLD_COUNT
  );
  const testNewItems = shuffleArray(unseenStimuli).slice(0, TEST_NEW_COUNT);

  const testPhaseStimuli = shuffleArray([
    ...testOldItems.map((i) => ({ ...i, item_type: "old" })),
    ...testNewItems.map((i) => ({ ...i, item_type: "new" })),
  ]);

  // ---------------------------------------------------------------------------
  // Test Phase – Items (WITH AUTO-SCORING)
  // ---------------------------------------------------------------------------

  testPhaseStimuli.forEach((item, index) => {
    timeline.push({
      ...baseTrial,
      type: SurveyMultiChoicePlugin,
      questions: [
        {
          prompt: `<p>${item.tr_sentence.replace("...", "_______")}</p>`,
          options: [
            item.tr_option1,
            item.tr_option2,
            i18next.t("options.new_sentence"),
          ],
          required: true,
        },
      ],
      button_label: i18next.t("buttons.confirm"),
      data: {
        phase: "test",
        item_id: item.id,
        item_index: index,
        item_type: item.item_type,
        correct_response:
          item.item_type === "old"
            ? item.shownVersion
            : i18next.t("options.new_sentence"),
      },
      on_finish: (data: any) => {
        const given = data.response?.Q0;
        const correct = data.correct_response;

        data.is_correct = given === correct;

        if (data.item_type === "old") {
          data.response_type = data.is_correct ? "hit" : "miss";
        } else {
          data.response_type = data.is_correct
            ? "correct_rejection"
            : "false_alarm";
        }
      },
    });
  });

  // ---------------------------------------------------------------------------
  // Completion
  // ---------------------------------------------------------------------------

  timeline.push({
    ...baseTrial,
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>${i18next.t("feedback.completion")}</p>`,
    trial_duration: 3000,
    data: { phase: "completion" },
  });

  // ---------------------------------------------------------------------------
  // DataPipe Upload Trial (en son)
  // ---------------------------------------------------------------------------

  const subject_id = jsPsych.randomization.randomID(10);
  const filename = `${subject_id}.json`;

  timeline.push({
    type: jsPsychPipe,
    action: "save",
    experiment_id: "f03fiHSxWknF", // DataPipe Experiment ID
    filename: filename,
    data_string: () => jsPsych.data.get().json(),
  });

  // ---------------------------------------------------------------------------
  // Run
  // ---------------------------------------------------------------------------

  await jsPsych.run(timeline);

  return jsPsych;
}
