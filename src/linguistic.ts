/**
 * @title Linguistic Test Experiment
 * @description Tez çalışması için geliştirilen dilsel deney uygulaması
 * @version 1.5.0
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

  const lang = currentLang()!;
  const subject_id = getOrCreateSubjectId();
  const activeDataPipeId = DATAPIPE_IDS[EXP_TYPE][lang];

  // 2. Session Yükleme
  let savedSession = SessionManager.load<SavedSession<LinguisticTestData>>(
    EXP_TYPE,
    subject_id
  );

  // 3. Yeni Oturum Oluşturma (Eğer kayıt yoksa)
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
    };
    SessionManager.save(EXP_TYPE, subject_id, savedSession);
  }

  // 4. Global Veri Özellikleri
  jsPsych.data.addProperties({
    subject_id: subject_id,
    participant_number: savedSession.participantNumber,
    experiment_type: EXP_TYPE,
    lang: lang,
  });

  // --- KRİTİK: ESKİ VERİLERİ BELLEĞE GERİ YÜKLE ---
  // Sayfa yenilendiğinde LocalStorage'daki verileri jsPsych hafızasına enjekte eder
  if (savedSession.trialData && savedSession.trialData.length > 0) {
    savedSession.trialData.forEach((d) => {
      jsPsych.data.get().push(d);
    });
  }

  // 5. Timeline Yardımcı Fonksiyonları
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

  // 6. TIMELINE AKIŞI

  // Preload (Dilsel deneyde görsel olmayabilir ama yapısal bütünlük için kalmalı)
  timeline.push(createPreloadTimeline(assetPaths.images || []));

  let currentIdx = 0;

  // Hoşgeldiniz
  const welcome = createWelcomeTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (welcome) timeline.push(welcome);

  // Öğrenme Aşaması Giriş
  const studyIntro = createStudyIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (studyIntro) timeline.push(studyIntro);

  // Öğrenme Aşaması (Study Phase)
  const studyTrials = createStudyPhaseTimeline(
    savedSession.studyStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    savedSession,
    GLOBAL_CONFIG.STUDY_PHASE_DELAY_MS || 2000
  );
  timeline.push(...studyTrials);
  currentIdx += savedSession.studyStimuli.length;

  // Test Aşaması Giriş
  const testIntro = createTestIntroTimeline(
    baseTrial,
    updateSession,
    currentIdx++,
    savedSession
  );
  if (testIntro) timeline.push(testIntro);

  // Test Aşaması (Test Phase)
  // GÜNCELLEME: jsPsych nesnesi ilk parametre olarak eklendi
  const testTrials = createTestPhaseTimeline(
    jsPsych,
    savedSession.testStimuli,
    baseTrial,
    updateSession,
    currentIdx,
    savedSession
  );
  timeline.push(...testTrials);
  currentIdx += savedSession.testStimuli.length;

  // Veri Kaydetme (DataPipe)
  timeline.push(
    createSaveTimeline(subject_id, jsPsych, EXP_TYPE, activeDataPipeId)
  );
  currentIdx++;

  // Deney Tamamlandı Ekranı
  timeline.push(createCompletionTimeline(baseTrial, EXP_TYPE, subject_id));

  // Deneyi Başlat
  await jsPsych.run(timeline);
  return jsPsych;
}
