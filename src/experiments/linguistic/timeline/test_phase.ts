import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import i18next from "i18next";
import { LinguisticTestData } from "../../../types/interfaces";
// Tüm Enum'lar merkezi yönetim ve veri tutarlılığı için içeri aktarıldı
import {
  Condition,
  ItemType,
  PerformanceCategory,
  ExperimentPhase,
  ErrorType,
} from "../../../types/enums";

export function createTestPhaseTimeline(
  _jsPsych: any, // Görsel test ile uyum ve linguistic.ts'deki 6 parametreli çağrı hatasını çözmek için eklendi
  testPhaseStimuli: LinguisticTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any
) {
  const trials: any[] = [];

  testPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;

    // --- GRANÜLER OTURUM KURTARMA (RESUME) MANTIĞI ---
    // Sadece bu deneme indeksi daha önce tamamlanmadıysa timeline'a ekle
    if (!savedSession || savedSession.trialIndex < currentIdx) {
      trials.push({
        ...baseTrial,
        type: SurveyMultiChoicePlugin,
        questions: [
          {
            prompt: `
              <div class="sentence-container">
                <p class="test-prompt">
                  ${item.sentence.replace("...", "_______")}
                </p>
              </div>
            `,
            options: [
              item.option1,
              item.option2,
              i18next.t("options.new_sentence"),
            ],
            required: true,
          },
        ],
        button_label: i18next.t("buttons.confirm"),

        // ANALİZ İÇİN: Düzleştirilmiş veri yapısı
        on_finish: (d: any) => {
          const response = d.response?.Q0;
          const newLabel = i18next.t("options.new_sentence");

          // Temel Bilgiler (Enum Kullanımı)
          d.phase = ExperimentPhase.RETRIEVAL;
          d.item_id = item.id;
          d.item_type = item.item_type;

          // Analiz için condition fallback (Boş kalmasını önler)
          d.condition = item.condition || Condition.NEW_ITEM;
          d.participant_response = response;

          // Zaman (Tense) Analizi için Karşılaştırma Alanları
          d.expected_tense =
            item.item_type === ItemType.OLD ? item.shownVersion : null;
          d.provided_tense =
            response !== newLabel ? response : "new_sentence_label";

          // Performans Kategorizasyonu (Enum Kullanımı)
          if (item.item_type === ItemType.OLD) {
            if (response === item.shownVersion) {
              d.performance_category = PerformanceCategory.HIT;
              d.is_correct = true;
              d.error_type = null;
            } else if (response === newLabel) {
              d.performance_category = PerformanceCategory.MISS;
              d.is_correct = false;
              d.error_type = ErrorType.FORGETTING; // Cümleyi hatırlayamadı
            } else {
              d.performance_category = PerformanceCategory.SOURCE_ERROR;
              d.is_correct = false;
              d.error_type = ErrorType.TENSE_MISMATCH; // Zamanı karıştırdı
            }
          } else {
            // item_type === ItemType.NEW
            if (response === newLabel) {
              d.performance_category = PerformanceCategory.CORRECT_REJECTION;
              d.is_correct = true;
              d.error_type = null;
            } else {
              d.performance_category = PerformanceCategory.FALSE_ALARM;
              d.is_correct = false;
              d.error_type = ErrorType.FALSE_MEMORY; // Yeni cümleyi gördü sandı
            }
          }

          // Oturum ilerlemesini ve veriyi kaydet
          updateSession(currentIdx, d);
        },
      });
    }
  });

  return trials;
}
