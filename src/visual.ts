/**
 * @title Visual Test Experiment
 * @description Görsel uyaranlar üzerinden kaynak bellek ölçümü
 * @version 1.0.0
 * @assets assets/visual/img/
 */

// src/visual.ts

import "../styles/main.scss";

import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

import { setupExperiment } from "./utils/startup";
import { currentLang } from "./utils/helpers";
import { getOrCreateSubjectId, SessionManager } from "./utils/session_manager";
import { registerParticipant } from "./utils/database";
import { generateVisualStimuli } from "./experiments/visual/utils/stimuli_factory";

// Havuzlar
import { studyPool, foilPool } from "./data/visual_stimuli";

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import { RunOptions, SavedSession, VisualTestData } from "./types/interfaces";

import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
} from "./config/constants";

// Timeline bileşenleri
import { createPreloadTimeline } from "./experiments/shared/timeline/preload";
import { createWelcomeTimeline } from "./experiments/shared/timeline/welcome";
import { createSaveTimeline } from "./experiments/shared/timeline/save";
import { createCompletionTimeline } from "./experiments/shared/timeline/completion";
import { createStudyPhaseTimeline } from "./experiments/visual/timeline/study_phase";
import { createTestPhaseTimeline } from "./experiments/visual/timeline/test_phase";
import { createStudyIntroTimeline } from "./experiments/visual/timeline/study_intro";
import { createTestIntroTimeline } from "./experiments/visual/timeline/test_intro";

const EXP_TYPE = "visual";
const VIS_CONFIG = EXPERIMENT_CONFIGS.visual;

export async function run({ assetPaths }: RunOptions) {
  // 1. STARTUP: i18n ve jsPsych başlatılması
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  const lang = currentLang()!;
  const subject_id = getOrCreateSubjectId();
  const activeDataPipeId = DATAPIPE_IDS[EXP_TYPE][lang];

  // 2. Katılımcı kontrolü
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

  // 3. Session ve kayıt yönetimi
  let savedSession = SessionManager.load<SavedSession<VisualTestData>>(
    EXP_TYPE,
    subject_id
  );

  if (!savedSession) {
    const participantNumber = await registerParticipant(lang, subject_id);

    // Uyaran üretimi
    const { learningPhaseStimuli, testPhaseStimuli } = generateVisualStimuli(
      studyPool,
      foilPool,
      {
        itemCountLearning: VIS_CONFIG.ITEM_COUNT_LEARNING,
        testOldCount: VIS_CONFIG.TEST_OLD_COUNT,
        testNewCount: VIS_CONFIG.TEST_NEW_COUNT,
        lang: lang,
        participantNumber: participantNumber,
      },
      assetPaths.images
    );

    savedSession = {
      studyStimuli: learningPhaseStimuli,
      testStimuli: testPhaseStimuli,
      trialIndex: -1,
      trialData: [],
      participantNumber: participantNumber,
    };
    SessionManager.save(EXP_TYPE, subject_id, savedSession);
  }

  // 4. Global veri özellikleri
  jsPsych.data.addProperties({
    subject_id: subject_id,
    participant_number: savedSession.participantNumber,
    experiment_type: EXP_TYPE,
    lang: lang,
  });

  if (savedSession.trialData && savedSession.trialData.length > 0) {
    // trialData dizisindeki her bir objeyi jsPsych veri havuzuna tek tek iterliyoruz
    savedSession.trialData.forEach((d) => {
      jsPsych.data.get().push(d);
    });
  }

  // 5. TIMELINE OLUŞTURMA
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

  // Manuel Preload için resim listesi
  const imagesToPreload = savedSession.studyStimuli
    .map((item) => item.image_path)
    .filter((path) => !!path) as string[];

  timeline.push(createPreloadTimeline(imagesToPreload));

  let currentIdx = 0;

  // Welcome
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (welcome) timeline.push(welcome);

  // Study Intro
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (studyIntro) timeline.push(studyIntro);

  // Study Phase
  const studyTrials = createStudyPhaseTimeline(
    savedSession.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    savedSession,
    GLOBAL_CONFIG.STUDY_PHASE_DELAY_MS || 3000
  );
  timeline.push(...studyTrials);
  currentIdx += savedSession.studyStimuli.length;

  // Test Intro
  const testIntro = createTestIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (testIntro) timeline.push(testIntro);

  // Test Phase (İki Aşamalı Düğüm Yapısı)
  const testTrials = createTestPhaseTimeline(
    jsPsych,
    savedSession.testStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    savedSession // Parametre eklendi
  );
  timeline.push(...testTrials);

  // ANALİZ NOTU: Her madde 2 slot kaplar (Tanıma + Kaynak)
  currentIdx += savedSession.testStimuli.length * 2;

  // Kayıt ve Bitiş
  timeline.push(
    createSaveTimeline(subject_id, jsPsych, EXP_TYPE, activeDataPipeId)
  );
  currentIdx++;

  timeline.push(createCompletionTimeline(baseTrial, EXP_TYPE, subject_id));

  await jsPsych.run(timeline);
  return jsPsych;
}
