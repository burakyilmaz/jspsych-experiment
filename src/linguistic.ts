/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 1.5.5
 * @assets assets/
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
import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
} from "./config/constants";
import { ExperimentType, Language } from "./types/enums";

const EXP_TYPE = "linguistic";
const LING_CONFIG = EXPERIMENT_CONFIGS.linguistic;

export async function run(_options: RunOptions) {
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  const {
    group,
    subject_id,
    savedSession: loadedSession,
  } = getExperimentContext<LinguisticTestData>(EXP_TYPE);

  let savedSession = loadedSession;

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

  if (!savedSession) {
    await jsPsych.run([createLanguageSelectionTimeline(jsPsych)]);

    const lastTrialData = jsPsych.data.get().last(1).values()[0];
    const selectedLang = lastTrialData.lang as Language;

    if (!selectedLang) {
      throw new Error("Dil seçimi verisi bulunamadı!");
    }

    const participantNumber = await registerParticipant(
      selectedLang,
      subject_id,
      ExperimentType.LINGUISTIC,
      group
    );

    const { learningPhaseStimuli, testPhaseStimuli } =
      generateLinguisticStimuli(studyPool, foilPool, {
        itemCountLearning: LING_CONFIG.ITEM_COUNT_LEARNING,
        testOldCount: LING_CONFIG.TEST_OLD_COUNT,
        testNewCount: LING_CONFIG.TEST_NEW_COUNT,
        lang: selectedLang,
        participantNumber: participantNumber,
      });

    savedSession = {
      studyStimuli: learningPhaseStimuli,
      testStimuli: testPhaseStimuli,
      trialIndex: -1,
      trialData: [],
      participantNumber: participantNumber,
      lang: selectedLang,
      group: group,
    } as any;

    SessionManager.save(EXP_TYPE, subject_id, savedSession);
  }

  // 🛡️ KRİTİK: Veri Geri Yükleme (Re-injection)
  // Sayfa yenilendiğinde eski verileri jsPsych hafızasına yükler.
  if (
    savedSession &&
    savedSession.trialData &&
    savedSession.trialData.length > 0
  ) {
    savedSession.trialData.forEach((d: any) => {
      jsPsych.data.get().push(d);
    });
  }

  if (!savedSession) {
    console.error("Kritik Hata: Oturum başlatılamadı.");
    return jsPsych;
  }

  i18next.changeLanguage(savedSession.lang);

  const mainTimeline = buildLinguisticTimeline(
    jsPsych,
    savedSession,
    subject_id,
    group
  );

  await jsPsych.run(mainTimeline);
  return jsPsych;
}

function buildLinguisticTimeline(
  jsPsych: any,
  session: any,
  subject_id: string,
  group: any
): any[] {
  const updateSession = (idx: number, data: any) =>
    SessionManager.updateProgress(EXP_TYPE, subject_id, session, idx, data);

  const baseTrial = {
    on_start: () => (jsPsych.getDisplayElement().innerHTML = ""),
  };
  const lang = session.lang as Language;
  const activeDataPipeId = (DATAPIPE_IDS as any)[EXP_TYPE][lang];
  let currentIdx = 0;

  jsPsych.data.addProperties({
    subject_id,
    participant_number: session.participantNumber,
    experiment_type: EXP_TYPE,
    lang,
    participant_group: group,
  });

  const preload = createPreloadTimeline([]);
  const demographics = createDemographicsTimeline(
    jsPsych,
    group,
    updateSession,
    currentIdx++
  );
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    session
  );

  // ÖĞRENME AŞAMASI
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    session
  );
  const studyTrials = createStudyPhaseTimeline(
    session.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    session,
    GLOBAL_CONFIG.STUDY_PHASE_DELAY_MS || 2000
  );
  currentIdx += session.studyStimuli.length;

  // TEST AŞAMASI
  const testIntro = createTestIntroTimeline(
    baseTrial,
    updateSession,
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
  // Not: Linguistic testinde her madde 1 trial kapladığı için çarpan eklenmedi.
  currentIdx += session.testStimuli.length;

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
    testIntro,
    ...testTrials,
    save,
    completion,
  ];
}
