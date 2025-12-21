/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 1.9.8
 */

import "../styles/main.scss";
import i18next from "i18next";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

import { setupExperiment } from "./utils/startup";
import { SessionManager } from "./utils/session_manager";
import { registerParticipant } from "./utils/database";
import { generateLinguisticStimuli } from "./experiments/linguistic/utils/stimuli_factory";
import { foilPool, studyPool } from "./data/linguistic_stimuli";

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import { RunOptions, LinguisticTestData } from "./types/interfaces";

import { createPreloadTimeline } from "./experiments/shared/timeline/preload";
import { createWelcomeTimeline } from "./experiments/shared/timeline/welcome";
import { createStudyIntroTimeline } from "./experiments/linguistic/timeline/study_intro";
import { createStudyPhaseTimeline } from "./experiments/linguistic/timeline/study_phase";
import { createTestIntroTimeline } from "./experiments/linguistic/timeline/test_intro";
import { createTestPhaseTimeline } from "./experiments/linguistic/timeline/test_phase";
import { createSaveTimeline } from "./experiments/shared/timeline/save";
import { createCompletionTimeline } from "./experiments/shared/timeline/completion";
import { createDemographicsTimeline } from "./experiments/shared/timeline/demographics";
import { createLanguageSelectionTimeline } from "./experiments/shared/timeline/language_selection";
import { getExperimentContext } from "./utils/experiment_loader";
import { ExperimentType, Language, Phase } from "./types/enums";
import { createInvalidPathTimeline } from "./experiments/shared/timeline/error_screens";
import { createDistractorIntro } from "./experiments/shared/timeline/distractor_intro";
import { createDistractorTimeline } from "./experiments/shared/timeline/distractor_phase";

import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
  TIMING_CONFIG,
  DISTRACTOR_CONFIG,
} from "./config/constants";

const EXP_TYPE = ExperimentType.LINGUISTIC;
const LING_CONFIG = EXPERIMENT_CONFIGS.linguistic;

export async function run(_options: RunOptions) {
  // 1. Teknik Kurulum
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  // 2. Context Yükleme ve Doğrulama
  const context = getExperimentContext<LinguisticTestData>(EXP_TYPE);
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

  // 3. OTURUM KURULUMU (Eğer kayıtlı oturum yoksa)
  if (!sessionToUse) {
    // A. Dil Seçimi
    await jsPsych.run([createLanguageSelectionTimeline(jsPsych)]);

    const displayElement = jsPsych.getDisplayElement();
    if (displayElement) {
      displayElement.innerHTML = `
        <div class="spinner-container">
          <div class="spinner"></div>
          <p style="margin-top:20px;">Deney hazırlanıyor, lütfen bekleyin...</p>
        </div>
      `;
    }

    try {
      const lastTrialData = jsPsych.data.get().last(1).values()[0];
      const selectedLang = lastTrialData.lang as Language;

      if (!selectedLang) throw new Error("Dil seçimi verisi alınamadı.");

      await i18next.changeLanguage(selectedLang);
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

      const { learningPhaseStimuli, testPhaseStimuli } =
        generateLinguisticStimuli(studyPool, foilPool, {
          itemCountLearning: LING_CONFIG.ITEM_COUNT_LEARNING,
          testOldCount: LING_CONFIG.TEST_OLD_COUNT,
          testNewCount: LING_CONFIG.TEST_NEW_COUNT,
          lang: selectedLang,
          participantNumber: participantNumber,
        });

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
        displayElement.innerHTML = `<p style='color:red; text-align:center;'>Kurulum Hatası: ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }</p>`;
      }
      return jsPsych;
    }
  } else {
    // 🛡️ ADIM 3: RESUME (GERİ YÜKLEME) SIRASINDA MANUEL MERGE
    // getProperties() hatasından kaçınmak için eldeki değişkenleri kullanıyoruz.
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
    // Mevcut özelliklere dili ve numarayı ekle
    jsPsych.data.addProperties({
      lang: sessionToUse.lang,
      participant_number: sessionToUse.participantNumber,
    });
  }

  const finalDisplay = jsPsych.getDisplayElement();
  if (finalDisplay) finalDisplay.innerHTML = "";

  // 4. ANA AKIŞI BAŞLAT
  const mainTimeline = buildLinguisticTimeline(
    jsPsych,
    sessionToUse!,
    subject_id,
    group!
  );

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

function buildLinguisticTimeline(
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
  const preload = createPreloadTimeline([]);
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
    TIMING_CONFIG.STUDY_DELAY_LINGUISTIC
  );
  currentIdx += session.studyStimuli.length;

  // [N+1] Distractor Intro
  const distractorIntro = createDistractorIntro(
    baseTrial,
    updateSetupSession,
    currentIdx++
  );

  // [N+2...] Distractor Trials
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
  currentIdx += session.testStimuli.length;

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
