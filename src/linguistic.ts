/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 0.9.2
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

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import linguisticData from "../assets/linguistic/data.json";

import { RunOptions, SentenceData, SavedSession } from "src/types/interfaces";

// -----------------------------------------------------------------------------
// KONFİGÜRASYON SABİTLERİ
// -----------------------------------------------------------------------------
const ITEM_COUNT_LEARNING = 4;
const TEST_OLD_COUNT = 2;
const TEST_NEW_COUNT = 2;
const STUDY_SENTENCE_DELAY_MS = 2000;
const CHECK_PREVIOUS_PARTICIPATION = false;

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function run({ assetPaths }: RunOptions) {
  // 1. i18n Başlat
  await i18next.init({
    lng: "tr",
    resources: {
      tr: { translation: trTranslations },
      de: { translation: deTranslations },
    },
  });

  // 2. jsPsych Root Elementi
  let root = document.getElementById("jspsych-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "jspsych-root";
    document.body.appendChild(root);
  }

  // ---------------------------------------------------------------------------
  // NAVBAR & DARK MODE
  // ---------------------------------------------------------------------------

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
    const btn = document.querySelector(".theme-toggle-btn");
    if (btn) {
      btn.textContent = isDark ? "☀️" : "🌙";
    }
  };

  const createDarkModeNavbar = () => {
    let existing = document.getElementById("dark-mode-navbar");
    if (existing) existing.remove();

    const navbar = document.createElement("div");
    navbar.id = "dark-mode-navbar";

    const button = document.createElement("button");
    button.className = "theme-toggle-btn";

    button.addEventListener("click", () => {
      const isCurrentlyDark = document.body.classList.contains("dark-mode");
      applyTheme(!isCurrentlyDark);
    });

    navbar.appendChild(button);
    document.body.appendChild(navbar);
  };

  createDarkModeNavbar();

  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  const jsPsych = initJsPsych({
    display_element: root,
    clear_html_on_finish: true,
  });

  // ---------------------------------------------------------------------------
  // GÜVENLİK ADIMI: DAHA ÖNCE KATILDI MI?
  // ---------------------------------------------------------------------------

  if (CHECK_PREVIOUS_PARTICIPATION) {
    if (localStorage.getItem("experiment_status") === "completed") {
      await jsPsych.run([
        {
          type: HtmlKeyboardResponsePlugin,
          stimulus: `<div style="padding: 20px;">
                       <p style="font-size: 24px; font-weight: bold; color: #ff5252;">
                         ⚠️
                       </p>
                       <p style="font-size: 20px;">
                         ${
                           i18next.t("feedback.already_participated") ||
                           "Bu çalışmaya daha önce katılım sağladınız."
                         }
                       </p>
                     </div>`,
          choices: "NO_KEYS",
        },
      ]);
      return jsPsych;
    }
  }

  // ---------------------------------------------------------------------------
  // SESSION & SUBJECT ID
  // ---------------------------------------------------------------------------

  let subject_id = localStorage.getItem("subject_id");
  if (!subject_id) {
    subject_id = Math.random().toString(36).substring(2, 12);
    localStorage.setItem("subject_id", subject_id);
  }

  const savedRaw = localStorage.getItem(`jspsych_resume_${subject_id}`);
  let savedSession: SavedSession | null = savedRaw
    ? JSON.parse(savedRaw)
    : null;

  // ---------------------------------------------------------------------------
  // STIMULI HAZIRLIĞI
  // ---------------------------------------------------------------------------

  let learningPhaseStimuli: SentenceData[];
  let unseenStimuli: SentenceData[];
  let testPhaseStimuli: SentenceData[];

  if (savedSession) {
    learningPhaseStimuli = savedSession.studyStimuli;
    testPhaseStimuli = savedSession.testStimuli;
  } else {
    const allStimuli = shuffleArray(linguisticData as SentenceData[]);
    learningPhaseStimuli = allStimuli
      .slice(0, ITEM_COUNT_LEARNING)
      .map((item) => ({
        ...item,
        item_type: "old",
        shownVersion: Math.random() < 0.5 ? item.tr_option1 : item.tr_option2,
      }));
    unseenStimuli = allStimuli.slice(ITEM_COUNT_LEARNING).map((item) => ({
      ...item,
      item_type: "new",
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
    localStorage.setItem(
      `jspsych_resume_${subject_id}`,
      JSON.stringify(savedSession)
    );
  }

  const clearScreen = () => {
    const el = jsPsych.getDisplayElement();
    if (el) el.innerHTML = "";
  };
  const baseTrial = { on_start: clearScreen };
  const timeline: any[] = [];

  // 1. Preload
  timeline.push({
    ...baseTrial,
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // 2. Welcome
  const welcomeIndex = 0;
  if (savedSession.trialIndex < welcomeIndex) {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("welcome")}</p>`,
      choices: [i18next.t("buttons.start")],
      data: { phase: "welcome" },
      on_finish: (data: any) => {
        savedSession!.trialIndex = welcomeIndex;
        savedSession!.trialData.push(data);
        localStorage.setItem(
          `jspsych_resume_${subject_id}`,
          JSON.stringify(savedSession)
        );
      },
    });
  }

  // 3. Study Intro
  const studyIntroIndex = 1;
  if (savedSession.trialIndex < studyIntroIndex) {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("intro.study_phase")}</p>`,
      choices: [i18next.t("buttons.continue")],
      data: { phase: "study_intro" },
      on_finish: (data: any) => {
        savedSession!.trialIndex = studyIntroIndex;
        savedSession!.trialData.push(data);
        localStorage.setItem(
          `jspsych_resume_${subject_id}`,
          JSON.stringify(savedSession)
        );
      },
    });
  }

  // 4. Study Phase
  learningPhaseStimuli.forEach((item, index) => {
    const trialIndexGlobal = studyIntroIndex + 1 + index;
    if (savedSession.trialIndex >= trialIndexGlobal) return;

    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<div class="sentence-container"><p class="study-sentence">${item.tr_sentence.replace(
        "...",
        item.shownVersion!
      )}</p></div>`,
      choices: [i18next.t("buttons.next")],
      enable_button_after: STUDY_SENTENCE_DELAY_MS,
      data: { phase: "study", item_id: item.id, item_index: index },
      on_finish: (data: any) => {
        savedSession!.trialIndex = trialIndexGlobal;
        savedSession!.trialData.push(data);
        localStorage.setItem(
          `jspsych_resume_${subject_id}`,
          JSON.stringify(savedSession)
        );
      },
    });
  });

  // 5. Test Intro
  const testIntroIndex = studyIntroIndex + learningPhaseStimuli.length + 1;
  if (savedSession.trialIndex < testIntroIndex) {
    timeline.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("intro.test_phase")}</p>`,
      choices: [i18next.t("buttons.start_test")],
      data: { phase: "test_intro" },
      on_finish: (data: any) => {
        savedSession!.trialIndex = testIntroIndex;
        savedSession!.trialData.push(data);
        localStorage.setItem(
          `jspsych_resume_${subject_id}`,
          JSON.stringify(savedSession)
        );
      },
    });
  }

  // 6. Test Phase
  testPhaseStimuli.forEach((item, index) => {
    const trialIndexGlobal = testIntroIndex + 1 + index;
    if (savedSession.trialIndex >= trialIndexGlobal) return;

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
      },
      on_finish: (data: any) => {
        data.is_correct =
          data.response?.Q0 ===
          (item.item_type === "old"
            ? item.shownVersion
            : i18next.t("options.new_sentence"));
        data.response_type =
          item.item_type === "old"
            ? data.is_correct
              ? "hit"
              : "miss"
            : data.is_correct
            ? "correct_rejection"
            : "false_alarm";

        savedSession!.trialIndex = trialIndexGlobal;
        savedSession!.trialData.push(data);
        localStorage.setItem(
          `jspsych_resume_${subject_id}`,
          JSON.stringify(savedSession)
        );
      },
    });
  });

  // 7. DataPipe Upload
  timeline.push({
    type: jsPsychPipe,
    action: "save",
    experiment_id: "f03fiHSxWknF",
    filename: `${subject_id}.json`,
    data_string: () => jsPsych.data.get().json(),
    on_load: () => {
      const displayEl = jsPsych.getDisplayElement();
      displayEl.innerHTML = `
        <div style="text-align: center;">
          <p style="font-size: 1.2rem; margin-bottom: 20px;">
            ${i18next.t("feedback.saving_data")}
          </p>
          <div class="spinner"></div>
        </div>
      `;
    },
    on_finish: () => {
      localStorage.setItem("experiment_status", "completed");
    },
  });

  // 8. Completion
  const completionIndex = testIntroIndex + testPhaseStimuli.length + 1;
  if (savedSession.trialIndex < completionIndex) {
    timeline.push({
      ...baseTrial,
      type: HtmlKeyboardResponsePlugin,
      stimulus: `<p>${i18next.t("feedback.completion")}</p>`,
      choices: "NO_KEYS",
      data: { phase: "completion" },
      on_start: () => {
        localStorage.removeItem(`jspsych_resume_${subject_id}`);
        localStorage.setItem("experiment_status", "completed");
      },
    });
  }

  await jsPsych.run(timeline);

  return jsPsych;
}
