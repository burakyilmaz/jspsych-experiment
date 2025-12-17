/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 0.9.4
 */

import "../styles/main.scss";
import "../styles/experiments/linguistic.scss";

import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import jsPsychPipe from "@jspsych-contrib/plugin-pipe";

import { setupExperiment } from "./utils/startup";

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import linguisticData from "../assets/linguistic/data.json";

import { RunOptions, SentenceData, SavedSession } from "src/types/interfaces";

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
const ITEM_COUNT_LEARNING = 4;
const TEST_OLD_COUNT = 2;
const TEST_NEW_COUNT = 2;
const STUDY_SENTENCE_DELAY_MS = 2000;
const CHECK_PREVIOUS_PARTICIPATION = false;

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function currentLang(): "tr" | "de" {
  return i18next.language.startsWith("de") ? "de" : "tr";
}

// -----------------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------------
export async function run({ assetPaths }: RunOptions) {
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  const lang = currentLang();

  // ---------------------------------------------------------------------------
  // PARTICIPATION CHECK
  // ---------------------------------------------------------------------------
  if (CHECK_PREVIOUS_PARTICIPATION) {
    if (localStorage.getItem("experiment_status_ling") === "completed") {
      await jsPsych.run([
        {
          type: HtmlKeyboardResponsePlugin,
          stimulus: `<p>${i18next.t("feedback.already_participated")}</p>`,
          choices: "NO_KEYS",
        },
      ]);
      return jsPsych;
    }
  }

  // ---------------------------------------------------------------------------
  // SUBJECT & SESSION
  // ---------------------------------------------------------------------------
  let subject_id = localStorage.getItem("subject_id");
  if (!subject_id) {
    subject_id = Math.random().toString(36).substring(2, 12);
    localStorage.setItem("subject_id", subject_id);
  }

  const SESSION_KEY = `jspsych_resume_ling_${subject_id}`;
  const savedRaw = localStorage.getItem(SESSION_KEY);
  let savedSession: SavedSession | null = savedRaw
    ? JSON.parse(savedRaw)
    : null;

  let learningPhaseStimuli: SentenceData[];
  let testPhaseStimuli: SentenceData[];

  if (savedSession) {
    learningPhaseStimuli = savedSession.studyStimuli;
    testPhaseStimuli = savedSession.testStimuli;
  } else {
    const allStimuli: SentenceData[] = shuffleArray(
      (linguisticData as any[]).map((item) => ({
        id: item.id,
        sentence: {
          tr: item.tr_sentence,
          de: item.de_sentence,
        },
        option1: {
          tr: item.tr_option1,
          de: item.de_option1,
        },
        option2: {
          tr: item.tr_option2,
          de: item.de_option2,
        },
      }))
    );

    learningPhaseStimuli = allStimuli
      .slice(0, ITEM_COUNT_LEARNING)
      .map((item) => {
        const shown =
          Math.random() < 0.5 ? item.option1[lang] : item.option2[lang];

        return {
          ...item,
          item_type: "old" as const,
          shownVersion: shown,
        };
      });

    const unseenStimuli = allStimuli.slice(ITEM_COUNT_LEARNING).map((item) => ({
      ...item,
      item_type: "new" as const,
    }));

    const testOldItems = shuffleArray(learningPhaseStimuli).slice(
      0,
      TEST_OLD_COUNT
    );
    const testNewItems = shuffleArray(unseenStimuli).slice(0, TEST_NEW_COUNT);

    testPhaseStimuli = shuffleArray([...testOldItems, ...testNewItems]);

    savedSession = {
      studyStimuli: learningPhaseStimuli,
      testStimuli: testPhaseStimuli,
      trialIndex: -1,
      trialData: [],
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(savedSession));
  }

  const timeline: any[] = [];
  const clearScreen = () => (jsPsych.getDisplayElement().innerHTML = "");
  const baseTrial = { on_start: clearScreen };

  const updateSession = (idx: number, data: any) => {
    savedSession!.trialIndex = idx;
    savedSession!.trialData.push(data);
    localStorage.setItem(SESSION_KEY, JSON.stringify(savedSession));
  };

  // ---------------------------------------------------------------------------
  // TIMELINE
  // ---------------------------------------------------------------------------
  timeline.push({
    ...baseTrial,
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  let idx = 0;

  // Welcome
  if (savedSession.trialIndex < idx) {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("welcome")}</p>`,
      choices: [i18next.t("buttons.start")],
      on_finish: (d) => updateSession(idx, d),
    });
  }
  idx++;

  // Study Intro
  if (savedSession.trialIndex < idx) {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("intro.study_phase")}</p>`,
      choices: [i18next.t("buttons.continue")],
      on_finish: (d) => updateSession(idx, d),
    });
  }
  idx++;

  // Study Phase
  learningPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;
    if (savedSession!.trialIndex >= currentIdx) return;

    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="sentence-container">
          <p class="study-sentence">
            ${item.sentence[lang].replace("...", item.shownVersion!)}
          </p>
        </div>
      `,
      choices: [i18next.t("buttons.next")],
      enable_button_after: STUDY_SENTENCE_DELAY_MS,
      on_finish: (d) => updateSession(currentIdx, d),
    });
  });

  idx += learningPhaseStimuli.length;

  // Test Intro
  if (savedSession.trialIndex < idx) {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("intro.test_phase")}</p>`,
      choices: [i18next.t("buttons.start_test")],
      on_finish: (d) => updateSession(idx, d),
    });
  }
  idx++;

  // Test Phase
  testPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;
    if (savedSession!.trialIndex >= currentIdx) return;

    timeline.push({
      ...baseTrial,
      type: SurveyMultiChoicePlugin,
      questions: [
        {
          prompt: `
            <div class="sentence-container">
              <p class="test-prompt">
                ${item.sentence[lang].replace("...", "_______")}
              </p>
            </div>
          `,
          options: [
            item.option1[lang],
            item.option2[lang],
            i18next.t("options.new_sentence"),
          ],
          required: true,
        },
      ],
      button_label: i18next.t("buttons.confirm"),
      on_finish: (d) => {
        d.is_correct =
          d.response?.Q0 ===
          (item.item_type === "old"
            ? item.shownVersion
            : i18next.t("options.new_sentence"));
        updateSession(currentIdx, d);
      },
    });
  });

  // ---------------------------------------------------------------------------
  // SAVE (Translated + Spinner)
  // ---------------------------------------------------------------------------
  timeline.push({
    type: jsPsychPipe,
    action: "save",
    experiment_id: "f03fiHSxWknF",
    filename: `${subject_id}.json`,
    data_string: () => jsPsych.data.get().json(),
    on_load: () => {
      jsPsych.getDisplayElement().innerHTML = `
        <div style="text-align:center">
          <p>${i18next.t("feedback.saving_data")}</p>
          <div class="spinner"></div>
        </div>
      `;
    },
    on_finish: () => {
      localStorage.setItem("experiment_status_ling", "completed");
    },
  });

  // Completion
  timeline.push({
    ...baseTrial,
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>${i18next.t("feedback.completion")}</p>`,
    choices: "NO_KEYS",
    on_start: () => {
      localStorage.removeItem(SESSION_KEY);
    },
  });

  await jsPsych.run(timeline);
  return jsPsych;
}
