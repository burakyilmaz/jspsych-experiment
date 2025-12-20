import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import i18next from "i18next";
import { LinguisticTestData } from "../../../types/interfaces";
// Tüm Enum'lar merkezi yönetim için dahil edildi
import {
  Condition,
  ItemType,
  PerformanceCategory,
  ExperimentPhase,
  ErrorType,
} from "../../../types/enums";

export function createTestPhaseTimeline(
  testPhaseStimuli: LinguisticTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any
) {
  const trials: any[] = [];

  testPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;

    // --- SESSION KURTARMA MANTIĞI ---
    // Eğer bu madde daha önce tamamlandıysa (savedSession'daki trialIndex bu indeksten büyük veya eşitse) atla
    if (savedSession && savedSession.trialIndex >= currentIdx) return;

    trials.push({
      ...baseTrial,
      type: SurveyMultiChoicePlugin,
      questions: [
        {
          prompt: `
            <div class=\"sentence-container\">
              <p class=\"test-prompt\">
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

        // Evre ve Madde Bilgileri (Enum Kullanımı)
        d.phase = ExperimentPhase.RETRIEVAL;
        d.item_id = item.id;
        d.item_type = item.item_type;

        // Condition Bilgisi (Boş kalmaması için fallback)
        d.condition = item.condition || Condition.NEW_ITEM;
        d.participant_response = response;

        // Zaman (Tense) Analizi için Karşılaştırma Alanları
        d.expected_tense =
          item.item_type === ItemType.OLD ? item.shownVersion : null;
        d.provided_tense =
          response !== newLabel ? response : "new_sentence_label";

        // Performans Kategorizasyonu (Hit, Miss, FA, CR, Source Error)
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

        // Oturum ilerlemesini kaydet
        updateSession(currentIdx, d);
      },
    });
  });

  return trials;
}
