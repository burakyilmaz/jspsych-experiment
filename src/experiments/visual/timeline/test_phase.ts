import { VisualTestData } from "../../../types/interfaces";
import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import i18next from "i18next";
// Tüm Enum'lar merkezi yönetim için dahil edildi
import {
  Condition,
  ItemType,
  PerformanceCategory,
  ExperimentPhase,
  ErrorType,
} from "../../../types/enums";

export function createTestPhaseTimeline(
  jsPsych: any,
  testPhaseStimuli: VisualTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any
) {
  const trials: any[] = [];

  testPhaseStimuli.forEach((item, i) => {
    // Her madde çift slot kaplar: 1. Tanıma, 2. Kaynak
    const recognitionIdx = idx + i * 2;
    const sourceIdx = idx + i * 2 + 1;

    // --- 1. TANIMA SORUSU (Recognition) ---
    // Sadece bu indeks daha önce tamamlanmadıysa timeline'a ekle
    if (!savedSession || savedSession.trialIndex < recognitionIdx) {
      const recognitionTrial = {
        ...baseTrial,
        type: SurveyMultiChoicePlugin,
        questions: [
          {
            prompt: `
            <div class="sentence-container">
              <p class="test-prompt">${item.sentence}</p>
            </div>
            <br>
            <p class="question-text">${i18next.t(
              "visual_test.questions.exists"
            )}</p>
          `,
            options: [
              i18next.t("visual_test.options.yes"),
              i18next.t("visual_test.options.no"),
            ],
            required: true,
            name: "recognition",
          },
        ],
        button_label: i18next.t("buttons.confirm"),
        on_finish: (d: any) => {
          const response = d.response.recognition;
          const yesLabel = i18next.t("visual_test.options.yes");
          const noLabel = i18next.t("visual_test.options.no");

          d.phase = ExperimentPhase.RETRIEVAL_RECOGNITION;
          d.item_id = item.id;
          d.item_type = item.item_type;
          d.condition = item.condition || Condition.NEW_ITEM;
          d.participant_response = response;

          if (item.item_type === ItemType.OLD) {
            const isHit = response === yesLabel;
            d.performance_category = isHit
              ? PerformanceCategory.HIT
              : PerformanceCategory.MISS;
            d.is_correct = isHit;
            d.error_type = isHit ? null : ErrorType.FORGETTING;
          } else {
            const isCR = response === noLabel;
            d.performance_category = isCR
              ? PerformanceCategory.CORRECT_REJECTION
              : PerformanceCategory.FALSE_ALARM;
            d.is_correct = isCR;
            d.error_type = isCR ? null : ErrorType.FALSE_MEMORY;
          }

          updateSession(recognitionIdx, d); //
        },
      };
      trials.push(recognitionTrial);
    }

    // --- 2. KAYNAK SORUSU (Source Monitoring) ---
    // Sadece bu indeks daha önce tamamlanmadıysa timeline'a ekle
    if (!savedSession || savedSession.trialIndex < sourceIdx) {
      const sourceTrial = {
        ...baseTrial,
        type: SurveyMultiChoicePlugin,
        questions: [
          {
            prompt: i18next.t("visual_test.questions.source"),
            options: [
              i18next.t("visual_test.options.saw_photo"),
              i18next.t("visual_test.options.inferred"),
            ],
            required: true,
            name: "source",
          },
        ],
        button_label: i18next.t("buttons.confirm"),
        on_finish: (d: any) => {
          const response = d.response.source;
          const sawPhotoLabel = i18next.t("visual_test.options.saw_photo");
          const inferredLabel = i18next.t("visual_test.options.inferred");

          d.phase = ExperimentPhase.RETRIEVAL_SOURCE;
          d.item_id = item.id;
          d.item_type = item.item_type;
          d.condition = item.condition || Condition.NEW_ITEM;
          d.source_response = response;

          // Beklenen kaynak kontrolü (Enum kullanımı düzeltildi)
          d.expected_source =
            item.condition === Condition.DIRECT ? sawPhotoLabel : inferredLabel;

          if (item.item_type === ItemType.OLD) {
            if (response === d.expected_source) {
              d.performance_category = PerformanceCategory.HIT;
              d.is_correct = true;
              d.error_type = null;
            } else {
              d.performance_category = PerformanceCategory.SOURCE_ERROR;
              d.is_correct = false;
              d.error_type = ErrorType.SOURCE_MISATTRIBUTION;
            }
          } else {
            d.performance_category = PerformanceCategory.FALSE_ALARM;
            d.is_correct = false;
            d.error_type = ErrorType.PHANTOM_SOURCE;
          }

          updateSession(sourceIdx, d); //
        },
      };

      // Koşullu Düğüm (Node): Sayfa yenilense bile önceki Tanıma cevabını kontrol eder
      const conditionalSourceNode = {
        timeline: [sourceTrial],
        conditional_function: function () {
          const yesLabel = i18next.t("visual_test.options.yes");

          // Önce jsPsych hafızasına bak (Re-injection yapıldıysa burada bulur)
          const recognitionData = jsPsych.data
            .get()
            .filter({
              item_id: item.id,
              phase: ExperimentPhase.RETRIEVAL_RECOGNITION,
            })
            .values()[0];

          if (recognitionData) {
            return recognitionData.participant_response === yesLabel;
          }

          // Sayfa yeni yüklendiyse ve re-injection henüz tamamlanmadıysa savedSession'dan bak
          if (savedSession && savedSession.trialData) {
            const savedMatch = savedSession.trialData.find(
              (d: any) =>
                d.item_id === item.id &&
                d.phase === ExperimentPhase.RETRIEVAL_RECOGNITION
            );
            return savedMatch && savedMatch.participant_response === yesLabel;
          }

          return false;
        },
      };
      trials.push(conditionalSourceNode);
    }
  });

  return trials;
}
