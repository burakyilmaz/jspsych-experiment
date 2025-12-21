// test_phase.ts
import { VisualTestData } from "../../../types/interfaces";
import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import i18next from "i18next";
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
  updateSession: any,
  idx: number,
  savedSession: any
) {
  const trials: any[] = [];

  testPhaseStimuli.forEach((item, i) => {
    const recognitionIdx = idx + i * 2;
    const sourceIdx = idx + i * 2 + 1;

    // --- 1. TANIMA SORUSU ---
    trials.push({
      ...baseTrial,
      type: SurveyMultiChoicePlugin,
      questions: [
        {
          prompt: `<div class="sentence-container"><p class="test-prompt">${
            item.sentence
          }</p></div><br><p class="question-text">${i18next.t(
            "visual_test.questions.exists"
          )}</p>`,
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
        updateSession(recognitionIdx, d);
      },
    });

    // --- 2. KAYNAK SORUSU ---
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
        d.expected_source =
          item.condition === Condition.DIRECT ? sawPhotoLabel : inferredLabel;

        if (item.item_type === ItemType.OLD) {
          if (response === d.expected_source) {
            d.performance_category = PerformanceCategory.HIT;
            d.is_correct = true;
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
        updateSession(sourceIdx, d);
      },
    };

    trials.push({
      timeline: [sourceTrial],
      conditional_function: function () {
        const yesLabel = i18next.t("visual_test.options.yes");
        const recognitionData = jsPsych.data
          .get()
          .filter({
            item_id: item.id,
            phase: ExperimentPhase.RETRIEVAL_RECOGNITION,
          })
          .values()[0];
        return recognitionData
          ? recognitionData.participant_response === yesLabel
          : false;
      },
    });
  });

  return trials;
}
