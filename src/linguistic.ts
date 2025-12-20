/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 1.5.1
 * @assets assets/
 */

import "../styles/main.scss";

import { setupExperiment } from "./utils/startup";
import { currentLang } from "./utils/helpers";
import { getOrCreateSubjectId, SessionManager } from "./utils/session_manager";
import { generateLinguisticStimuli } from "./experiments/linguistic/utils/stimuli_factory";

import trTranslations from "../src/locales/tr/translation.json";
import deTranslations from "../src/locales/de/translation.json";
import { foilPool, studyPool } from "./data/linguistic_stimuli";
import {
  RunOptions,
  SavedSession,
  LinguisticTestData,
} from "../src/types/interfaces";

import { createPreloadTimeline } from "./experiments/shared/timeline/preload";
import { createWelcomeTimeline } from "./experiments/shared/timeline/welcome";
import { createStudyIntroTimeline } from "./experiments/linguistic/timeline/study_intro";
import { createStudyPhaseTimeline } from "./experiments/linguistic/timeline/study_phase";
import { createTestIntroTimeline } from "./experiments/linguistic/timeline/test_intro";
import { createTestPhaseTimeline } from "./experiments/linguistic/timeline/test_phase";
import { createSaveTimeline } from "./experiments/shared/timeline/save";
import { createCompletionTimeline } from "./experiments/shared/timeline/completion";

import {
  GLOBAL_CONFIG,
  EXPERIMENT_CONFIGS,
  DATAPIPE_IDS,
} from "./config/constants";
import { registerParticipant } from "./utils/database";

const EXP_TYPE = "linguistic";
const LING_CONFIG = EXPERIMENT_CONFIGS.linguistic;

export async function run({ assetPaths }: RunOptions) {
  // 1. STARTUP: i18n ve jsPsych başlatılması
  const { jsPsych } = await setupExperiment({
    trResources: trTranslations,
    deResources: deTranslations,
  });

  const lang = currentLang()!; // i18next tarafından onaylanmış aktif dil
  const subject_id = getOrCreateSubjectId();
  const activeDataPipeId = DATAPIPE_IDS[EXP_TYPE][lang];

  // 2. Session Yükleme
  let savedSession = SessionManager.load<SavedSession<LinguisticTestData>>(
    EXP_TYPE,
    subject_id
  );

  /**
   * GÜNCELLENMİŞ LANGUAGE GUARD:
   * Mantık: Eğer bir oturum varsa VE (oturumun dili kaydedilmemişse VEYA mevcut dilden farklıysa) SIFIRLA.
   * Bu sayede "undefined" olan eski oturumlar da yeni dile geçince otomatik silinir.
   */
  if (savedSession && (savedSession as any).lang !== lang) {
    console.warn(
      "Language mismatch detected. Resetting session for data integrity."
    );
    SessionManager.clear(EXP_TYPE, subject_id);
    savedSession = null;
  }

  // 3. Yeni Oturum Oluşturma (Eğer kayıt yoksa veya dil uyuşmazlığı nedeniyle silindiyse)
  if (!savedSession) {
    const participantNumber = await registerParticipant(lang, subject_id);

    const { learningPhaseStimuli, testPhaseStimuli } =
      generateLinguisticStimuli(studyPool, foilPool, {
        itemCountLearning: LING_CONFIG.ITEM_COUNT_LEARNING,
        testOldCount: LING_CONFIG.TEST_OLD_COUNT,
        testNewCount: LING_CONFIG.TEST_NEW_COUNT,
        lang: lang,
        participantNumber: participantNumber,
      });

    savedSession = {
      studyStimuli: learningPhaseStimuli,
      testStimuli: testPhaseStimuli,
      trialIndex: -1,
      trialData: [],
      participantNumber: participantNumber,
      lang: lang, // Aktif dili oturuma mühürle
    } as any;
    SessionManager.save(EXP_TYPE, subject_id, savedSession);
  }

  const currentSession = savedSession!;

  // 4. Global Veri Özellikleri
  jsPsych.data.addProperties({
    subject_id: subject_id,
    participant_number: currentSession.participantNumber,
    experiment_type: EXP_TYPE,
    lang: lang,
  });

  // --- ESKİ VERİLERİ BELLEĞE GERİ YÜKLE ---
  if (currentSession.trialData && currentSession.trialData.length > 0) {
    currentSession.trialData.forEach((d) => {
      jsPsych.data.get().push(d);
    });
  }

  // 5. Timeline Hazırlığı
  const timeline: any[] = [];
  const baseTrial = {
    on_start: () => (jsPsych.getDisplayElement().innerHTML = ""),
  };

  const updateSession = (idx: number, data: any) =>
    SessionManager.updateProgress(
      EXP_TYPE,
      subject_id,
      currentSession,
      idx,
      data
    );

  // 6. TIMELINE AKIŞI
  timeline.push(createPreloadTimeline(assetPaths.images || []));

  let currentIdx = 0;

  // Hoşgeldiniz
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    currentSession
  );
  if (welcome) timeline.push(welcome);

  // Öğrenme Aşaması Giriş
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    currentSession
  );
  if (studyIntro) timeline.push(studyIntro);

  // Öğrenme Aşaması (Study Phase)
  const studyTrials = createStudyPhaseTimeline(
    currentSession.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    currentSession,
    GLOBAL_CONFIG.STUDY_PHASE_DELAY_MS || 2000
  );
  timeline.push(...studyTrials);
  currentIdx += currentSession.studyStimuli.length;

  // Test Aşaması Giriş
  const testIntro = createTestIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    currentSession
  );
  if (testIntro) timeline.push(testIntro);

  // Test Aşaması (Test Phase)
  const testTrials = createTestPhaseTimeline(
    jsPsych,
    currentSession.testStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    currentSession
  );
  timeline.push(...testTrials);
  currentIdx += currentSession.testStimuli.length;

  // Kayıt ve Teşekkür
  timeline.push(
    createSaveTimeline(subject_id, jsPsych, EXP_TYPE, activeDataPipeId)
  );
  timeline.push(createCompletionTimeline(baseTrial, EXP_TYPE, subject_id));

  await jsPsych.run(timeline);
  return jsPsych;
}
