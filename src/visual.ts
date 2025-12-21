/**
 * @title Visual Test Experiment
 * @description Görsel uyaranlar üzerinden kaynak bellek ölçümü
 * @version 1.9.9
 * @assets assets/visual/img/
 */

import "../styles/main.scss";
import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

import { setupExperiment } from "./utils/startup";
import { SessionManager } from "./utils/session_manager";
import { registerParticipant } from "./utils/database";
import { generateVisualStimuli } from "./experiments/visual/utils/stimuli_factory";
import { studyPool, foilPool } from "./data/visual_stimuli";

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import { RunOptions, VisualTestData } from "./types/interfaces";

// 🛡️ Merkezi konfigürasyon importları
import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
  TIMING_CONFIG,
  DISTRACTOR_CONFIG,
} from "./config/constants";

import { createPreloadTimeline } from "./experiments/shared/timeline/preload";
import { createWelcomeTimeline } from "./experiments/shared/timeline/welcome";
import { createSaveTimeline } from "./experiments/shared/timeline/save";
import { createCompletionTimeline } from "./experiments/shared/timeline/completion";
import { createStudyPhaseTimeline } from "./experiments/visual/timeline/study_phase";
import { createTestPhaseTimeline } from "./experiments/visual/timeline/test_phase";
import { createStudyIntroTimeline } from "./experiments/visual/timeline/study_intro";
import { createTestIntroTimeline } from "./experiments/visual/timeline/test_intro";
import { createDemographicsTimeline } from "./experiments/shared/timeline/demographics";
import { createLanguageSelectionTimeline } from "./experiments/shared/timeline/language_selection";
import { getExperimentContext } from "./utils/experiment_loader";
import { ExperimentType, Language, Phase } from "./types/enums";
import { createInvalidPathTimeline } from "./experiments/shared/timeline/error_screens";
import { createDistractorIntro } from "./experiments/shared/timeline/distractor_intro";
import { createDistractorTimeline } from "./experiments/shared/timeline/distractor_phase";

const EXP_TYPE = ExperimentType.VISUAL;
const VIS_CONFIG = EXPERIMENT_CONFIGS.visual;

export async function run({ assetPaths }: RunOptions) {
  // 1. Teknik Kurulum
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  // 2. Context Yükleme ve Doğrulama
  const context = getExperimentContext<VisualTestData>(EXP_TYPE);
  if (!context.isValid) {
    await jsPsych.run([createInvalidPathTimeline()]);
    return jsPsych;
  }

  const { group, subject_id, savedSession: loadedSession } = context;
  let sessionToUse = loadedSession;

  // 🛡️ ADIM 1: Global özellikleri hemen mühürle (Zorunlu Alanlar için)
  jsPsych.data.addProperties({
    subject_id,
    experiment_type: EXP_TYPE,
    participant_group: group,
  });

  // Katılım Kontrolü
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

  // 3. OTURUM KURULUMU (Yeni Başlangıç)
  if (!sessionToUse) {
    // A. Dil Seçimi
    await jsPsych.run([createLanguageSelectionTimeline(jsPsych)]);

    const lastTrialData = jsPsych.data.get().last(1).values()[0];
    const selectedLang = lastTrialData.lang as Language;
    if (!selectedLang) throw new Error("Language selection failed.");

    // 🛡️ KRİTİK: Spinner'dan ÖNCE dili değiştiriyoruz
    await i18next.changeLanguage(selectedLang);

    const displayElement = jsPsych.getDisplayElement();
    if (displayElement) {
      displayElement.innerHTML = `
        <div class="spinner-container">
          <div class="spinner"></div>
          <p style="margin-top:20px;">${i18next.t("setup.preparing")}</p>
        </div>
      `;
    }

    try {
      // Veritabanı Kaydı
      const participantNumber = await registerParticipant(
        selectedLang,
        subject_id,
        EXP_TYPE,
        group!
      );

      // 🛡️ ADIM 2: Yeni oturumda dile ve katılımcı numarasına ait özellikleri ekle
      jsPsych.data.addProperties({
        lang: selectedLang,
        participant_number: participantNumber,
      });

      const { learningPhaseStimuli, testPhaseStimuli } = generateVisualStimuli(
        studyPool,
        foilPool,
        {
          itemCountLearning: VIS_CONFIG.ITEM_COUNT_LEARNING,
          testOldCount: VIS_CONFIG.TEST_OLD_COUNT,
          testNewCount: VIS_CONFIG.TEST_NEW_COUNT,
          lang: selectedLang,
          participantNumber: participantNumber,
        },
        assetPaths.images
      );

      sessionToUse = {
        studyStimuli: learningPhaseStimuli,
        testStimuli: testPhaseStimuli,
        trialIndex: -1,
        trialData: [],
        participantNumber: participantNumber,
        lang: selectedLang,
        group: group!,
      } as any;

      SessionManager.save(EXP_TYPE, subject_id, sessionToUse);
    } catch (error) {
      console.error("Setup Error:", error);
      if (displayElement) {
        displayElement.innerHTML = `<p style='color:red; text-align:center;'>${i18next.t(
          "setup.error"
        )}: ${error instanceof Error ? error.message : "Unknown error"}</p>`;
      }
      return jsPsych;
    }
  } else {
    // 🛡️ ADIM 3: RESUME (GERİ YÜKLEME) SIRASINDA MANUEL MERGE
    // Veritabanındaki trialData'ya zorunlu DataPipe sütunlarını manuel ekliyoruz
    if (sessionToUse.trialData?.length > 0) {
      sessionToUse.trialData.forEach((d: any) => {
        jsPsych.data.get().push({
          ...d,
          subject_id,
          experiment_type: EXP_TYPE,
          participant_group: group,
          lang: sessionToUse!.lang,
          participant_number: sessionToUse!.participantNumber,
        });
      });
    }
    await i18next.changeLanguage(sessionToUse.lang);
    jsPsych.data.addProperties({
      lang: sessionToUse.lang,
      participant_number: sessionToUse.participantNumber,
    });
  }

  const finalDisplay = jsPsych.getDisplayElement();
  if (finalDisplay) finalDisplay.innerHTML = "";

  // 4. ANA AKIŞI BAŞLAT
  const mainTimeline = buildExperimentTimeline(
    jsPsych,
    sessionToUse!,
    subject_id,
    group!
  );

  // 🛡️ İndeksleme Mantığı (Slicing)
  const startIndex =
    sessionToUse!.trialIndex === -1 ? 0 : sessionToUse!.trialIndex + 1;
  const timelineToRun = mainTimeline.slice(startIndex);

  if (timelineToRun.length === 0) {
    console.warn("Tüm denemeler bitmiş.");
    return jsPsych;
  }

  await jsPsych.run(timelineToRun);
  return jsPsych;
}

function buildExperimentTimeline(
  jsPsych: any,
  session: any,
  subject_id: string,
  group: any
): any[] {
  const updateSetupSession = (idx: number, data: any) => {
    data.phase = Phase.SETUP;
    SessionManager.updateProgress(EXP_TYPE, subject_id, session, idx, data);
  };

  const updateSession = (idx: number, data: any) =>
    SessionManager.updateProgress(EXP_TYPE, subject_id, session, idx, data);

  const baseTrial = {
    on_start: () => (jsPsych.getDisplayElement().innerHTML = ""),
  };
  const lang = session.lang as Language;
  const activeDataPipeId = (DATAPIPE_IDS as any)[EXP_TYPE][lang];

  let currentIdx = 0;

  // [0] Preload
  const images = session.studyStimuli
    .map((i: any) => i.image_path)
    .filter((p: any) => !!p);
  const preload = createPreloadTimeline(images);
  currentIdx++;

  // [1] Demographics
  const demographics = createDemographicsTimeline(
    jsPsych,
    group,
    updateSetupSession,
    currentIdx++,
    EXP_TYPE,
    subject_id
  );

  // [2] Welcome
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  );

  // [3] Study Intro
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  );

  // [4...N] Study Trials
  const studyTrials = createStudyPhaseTimeline(
    session.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    session,
    TIMING_CONFIG.STUDY_DELAY_VISUAL
  );
  currentIdx += session.studyStimuli.length;

  // Distractor (Ara Görev)
  const distractorIntro = createDistractorIntro(
    baseTrial,
    updateSetupSession,
    currentIdx++
  );
  const distractorTrials = createDistractorTimeline(updateSession, currentIdx);
  currentIdx += DISTRACTOR_CONFIG.TRIAL_COUNT * 2;

  // Test
  const testIntro = createTestIntroTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  );
  const testTrials = createTestPhaseTimeline(
    jsPsych,
    session.testStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    session
  );
  // 🛡️ ÖNEMLİ: Visual testinde her madde için 2 trial (Tanıma + Kaynak)
  currentIdx += session.testStimuli.length * 2;

  // Kayıt ve Bitiş
  const save = createSaveTimeline(
    subject_id,
    jsPsych,
    EXP_TYPE,
    activeDataPipeId
  );
  const completion = createCompletionTimeline(baseTrial, EXP_TYPE, subject_id);

  return [
    preload,
    demographics,
    welcome,
    studyIntro,
    ...studyTrials,
    distractorIntro,
    ...distractorTrials,
    testIntro,
    ...testTrials,
    save,
    completion,
  ];
}
