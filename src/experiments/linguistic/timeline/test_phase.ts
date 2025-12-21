import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import i18next from "i18next";
import { LinguisticTestData } from "../../../types/interfaces";
import {
  Condition,
  ItemType,
  PerformanceCategory,
  ExperimentPhase,
  ErrorType,
} from "../../../types/enums";

export function createTestPhaseTimeline(
  _jsPsych: any,
  testPhaseStimuli: LinguisticTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  _savedSession: any
) {
  const trials: any[] = [];

  testPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;

    trials.push({
      ...baseTrial,
      type: SurveyMultiChoicePlugin,
      questions: [
        {
          prompt: `<div class="sentence-container"><p class="test-prompt">${item.sentence.replace(
            "...",
            "_______"
          )}</p></div>`,
          options: [
            item.option1,
            item.option2,
            i18next.t("options.new_sentence"),
          ],
          required: true,
        },
      ],
      button_label: i18next.t("buttons.confirm"),
      on_finish: (d: any) => {
        const response = d.response?.Q0;
        const newLabel = i18next.t("options.new_sentence");

        d.phase = ExperimentPhase.RETRIEVAL;
        d.item_id = item.id;
        d.item_type = item.item_type;
        d.condition = item.condition || Condition.NEW_ITEM;
        d.participant_response = response;
        d.expected_tense =
          item.item_type === ItemType.OLD ? item.shownVersion : null;
        d.provided_tense =
          response !== newLabel ? response : "new_sentence_label";

        if (item.item_type === ItemType.OLD) {
          if (response === item.shownVersion) {
            d.performance_category = PerformanceCategory.HIT;
            d.is_correct = true;
          } else if (response === newLabel) {
            d.performance_category = PerformanceCategory.MISS;
            d.is_correct = false;
            d.error_type = ErrorType.FORGETTING;
          } else {
            d.performance_category = PerformanceCategory.SOURCE_ERROR;
            d.is_correct = false;
            d.error_type = ErrorType.TENSE_MISMATCH;
          }
        } else {
          if (response === newLabel) {
            d.performance_category = PerformanceCategory.CORRECT_REJECTION;
            d.is_correct = true;
          } else {
            d.performance_category = PerformanceCategory.FALSE_ALARM;
            d.is_correct = false;
            d.error_type = ErrorType.FALSE_MEMORY;
          }
        }
        updateSession(currentIdx, d);
      },
    });
  });

  return trials;
}
