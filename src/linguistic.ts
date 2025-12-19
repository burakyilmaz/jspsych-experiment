/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 1.3.0
 */

// src/linguistic.ts

import "../styles/main.scss";
import "../styles/linguistic.scss";

import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

import { setupExperiment } from "./utils/startup";
import { currentLang } from "./utils/helpers";
import { getOrCreateSubjectId, SessionManager } from "./utils/session_manager";
import { generateLinguisticStimuli } from "./linguistic/utils/stimuli_factory";

// Yeni Tip Güvenli Veriler
import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";

import { RunOptions, SavedSession } from "src/types/interfaces";

// Modüler Timeline Fonksiyonları
import { createPreloadTimeline } from "./linguistic/timeline/preload";
import { createWelcomeTimeline } from "./linguistic/timeline/welcome";
import { createStudyIntroTimeline } from "./linguistic/timeline/study_intro";
import { createStudyPhaseTimeline } from "./linguistic/timeline/study_phase";
import { createTestIntroTimeline } from "./linguistic/timeline/test_intro";
import { createTestPhaseTimeline } from "./linguistic/timeline/test_phase";
import { createSaveTimeline } from "./linguistic/timeline/save";
import { createCompletionTimeline } from "./linguistic/timeline/completion";
import { foilItems, studyItems } from "./data/linguistic_stimuli";
import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
} from "./config/constants";

const EXP_TYPE = "linguistic";
const LING_CONFIG = EXPERIMENT_CONFIGS.linguistic; // Deneye özel ayarlar

export async function run({ assetPaths }: RunOptions) {
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  // 1. DİL KONTROLÜ (VALIDATION)
  const lang = currentLang();

  const subject_id = getOrCreateSubjectId();
  const activeDataPipeId = DATAPIPE_IDS[EXP_TYPE][lang];

  // 1. KATILIMCI KONTROLÜ
  if (
    GLOBAL_CONFIG.CHECK_PREVIOUS_PARTICIPATION &&
    SessionManager.isCompleted(EXP_TYPE)
  ) {
    await jsPsych.run([
      {
        type: HtmlKeyboardResponsePlugin,
        stimulus: `<p>${i18next.t("feedback.already_participated")}</p>`,
        choices: "NO_KEYS",
      },
    ]);
    return jsPsych;
  }

  // 2. OTURUM YÜKLEME VEYA YENİDEN OLUŞTURMA
  let savedSession = SessionManager.load<SavedSession>(EXP_TYPE, subject_id);

  if (!savedSession) {
    // Fabrikayı yeni listelerle çağırıyoruz
    const { learningPhaseStimuli, testPhaseStimuli } =
      generateLinguisticStimuli(studyItems, foilItems, {
        itemCountLearning: LING_CONFIG.ITEM_COUNT_LEARNING,
        testOldCount: LING_CONFIG.TEST_OLD_COUNT,
        testNewCount: LING_CONFIG.TEST_NEW_COUNT,
        lang,
      });

    savedSession = {
      studyStimuli: learningPhaseStimuli,
      testStimuli: testPhaseStimuli,
      trialIndex: -1,
      trialData: [],
    };
    SessionManager.save(EXP_TYPE, subject_id, savedSession);
  }

  // 3. TIMELINE HAZIRLIĞI
  const timeline: any[] = [];
  const baseTrial = {
    on_start: () => (jsPsych.getDisplayElement().innerHTML = ""),
  };
  const updateSession = (idx: number, data: any) =>
    SessionManager.updateProgress(
      EXP_TYPE,
      subject_id,
      savedSession!,
      idx,
      data
    );

  // ---------------------------------------------------------------------------
  // TIMELINE AKIŞI
  // ---------------------------------------------------------------------------
  timeline.push(createPreloadTimeline(assetPaths));

  let currentIdx = 0;

  // Hoşgeldiniz ve Giriş
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (welcome) timeline.push(welcome);

  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (studyIntro) timeline.push(studyIntro);

  // Öğrenme Aşaması
  const studyTrials = createStudyPhaseTimeline(
    savedSession.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    savedSession,
    lang,
    GLOBAL_CONFIG.STUDY_SENTENCE_DELAY_MS
  );
  timeline.push(...studyTrials);
  currentIdx += savedSession.studyStimuli.length;

  // Test Aşaması
  const testIntro = createTestIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (testIntro) timeline.push(testIntro);

  const testTrials = createTestPhaseTimeline(
    savedSession.testStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    savedSession,
    lang
  );
  timeline.push(...testTrials);

  // Kayıt ve Bitiş
  timeline.push(
    createSaveTimeline(subject_id, jsPsych, EXP_TYPE, activeDataPipeId)
  );
  timeline.push(createCompletionTimeline(baseTrial, EXP_TYPE, subject_id));

  await jsPsych.run(timeline);
  return jsPsych;
}
