/**
 * @title Visual Test Experiment
 * @description Görsel uyaranlar üzerinden kaynak bellek ölçümü
 * @version 1.5.8
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

import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
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
import { ExperimentType, Language } from "./types/enums";
import { createInvalidPathTimeline } from "./experiments/shared/timeline/error_screens";

const EXP_TYPE = "visual";
const VIS_CONFIG = EXPERIMENT_CONFIGS.visual;

export async function run({ assetPaths }: RunOptions) {
  // 1. STARTUP: Temel motorun kurulması
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  // Loader'dan context al
  const context = getExperimentContext<VisualTestData>(EXP_TYPE);

  // 🛡️ 404 KONTROLÜ
  // @ts-ignore
  if (!context.isValid) {
    await jsPsych.run([createInvalidPathTimeline()]);
    return jsPsych;
  }

  // Context geçerliyse verileri çıkaralım
  const { group, subject_id, savedSession: loadedSession } = context;
  let savedSession = loadedSession;

  // 3. Katılım Kontrolü
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

  // 4. SESSION HAZIRLIĞI (Yeni Oturum)
  if (!savedSession) {
    // Dil Seçimi
    jsPsych.data.addProperties({ lang: null });
    await jsPsych.run([createLanguageSelectionTimeline(jsPsych)]);

    const lastTrialData = jsPsych.data.get().last(1).values()[0];
    const selectedLang =
      lastTrialData.response === 0 ? Language.TR : Language.DE;

    if (!selectedLang) {
      throw new Error("Dil seçimi başarısız oldu.");
    }

    await i18next.changeLanguage(selectedLang);

    // Kayıt ve Uyaran Üretimi
    const participantNumber = await registerParticipant(
      selectedLang,
      subject_id,
      ExperimentType.VISUAL,
      group!
    );

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

    savedSession = {
      studyStimuli: learningPhaseStimuli,
      testStimuli: testPhaseStimuli,
      trialIndex: -1,
      trialData: [],
      participantNumber: participantNumber,
      lang: selectedLang,
      group: group!,
    } as any;

    SessionManager.save(EXP_TYPE, subject_id, savedSession);
  }

  // 5. RESUME & DATA RE-INJECTION
  if (savedSession) {
    await i18next.changeLanguage(savedSession.lang);
    if (savedSession.trialData && savedSession.trialData.length > 0) {
      savedSession.trialData.forEach((d: any) => {
        jsPsych.data.get().push(d);
      });
    }
  }

  // 6. DENEYİ BAŞLAT
  const experimentTimeline = buildExperimentTimeline(
    jsPsych,
    savedSession!,
    subject_id,
    group!
  );

  await jsPsych.run(experimentTimeline);
  return jsPsych;
}

/**
 * Ana timeline inşası
 */
function buildExperimentTimeline(
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

  const images = session.studyStimuli
    .map((i: any) => i.image_path)
    .filter((p: any) => !!p);
  const preload = createPreloadTimeline(images);

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
    GLOBAL_CONFIG.STUDY_PHASE_DELAY_MS || 3000
  );
  currentIdx += session.studyStimuli.length;

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
  currentIdx += session.testStimuli.length * 2;

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
