/**
 * @title Visual Test Experiment
 * @description Görsel uyaranlar üzerinden kaynak bellek ölçümü
 * @version 1.9.8
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
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  const context = getExperimentContext<VisualTestData>(EXP_TYPE);
  if (!context.isValid) {
    await jsPsych.run([createInvalidPathTimeline()]);
    return jsPsych;
  }

  const { group, subject_id, savedSession: loadedSession } = context;
  let sessionToUse = loadedSession;

  // 🛡️ ADIM 1: Global özellikleri hemen mühürle (DataPipe Validation için)
  jsPsych.data.addProperties({
    subject_id,
    experiment_type: EXP_TYPE,
    participant_group: group,
  });

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

  if (!sessionToUse) {
    await jsPsych.run([createLanguageSelectionTimeline(jsPsych)]);

    const displayElement = jsPsych.getDisplayElement();
    if (displayElement) {
      displayElement.innerHTML = `<div class="spinner-container"><div class="spinner"></div><p>Hazırlanıyor...</p></div>`;
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
      if (displayElement)
        displayElement.innerHTML = `<p style='color:red;'>Hata: ${error}</p>`;
      return jsPsych;
    }
  } else {
    // 🛡️ ADIM 3: RESUME (GERİ YÜKLEME) SIRASINDA MANUEL MERGE
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

  const mainTimeline = buildExperimentTimeline(
    jsPsych,
    sessionToUse!,
    subject_id,
    group!
  );

  // 🛡️ İndeksleme Mantığı
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

  const images = session.studyStimuli
    .map((i: any) => i.image_path)
    .filter((p: any) => !!p);
  const preload = createPreloadTimeline(images);
  currentIdx++; // 0

  const demographics = createDemographicsTimeline(
    jsPsych,
    group,
    updateSetupSession,
    currentIdx++,
    EXP_TYPE,
    subject_id
  ); // 1
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  ); // 2
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSetupSession,
    currentIdx++,
    session
  ); // 3

  const studyTrials = createStudyPhaseTimeline(
    session.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    session,
    TIMING_CONFIG.STUDY_DELAY_VISUAL
  );
  currentIdx += session.studyStimuli.length;

  const distractorIntro = createDistractorIntro(
    baseTrial,
    updateSetupSession,
    currentIdx++
  );
  const distractorTrials = createDistractorTimeline(updateSession, currentIdx);
  currentIdx += DISTRACTOR_CONFIG.TRIAL_COUNT * 2;

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
  currentIdx += session.testStimuli.length * 2; // Visual testinde 2 trial (Tanıma + Kaynak)

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
