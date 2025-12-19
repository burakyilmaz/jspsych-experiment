import SurveyMultiChoicePlugin from "@jspsych/plugin-survey-multi-choice";
import i18next from "i18next";
import { SentenceData } from "../../../types/interfaces";

export function createTestPhaseTimeline(
  testPhaseStimuli: SentenceData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any,
  lang: "tr" | "de"
) {
  const trials: any[] = [];
  testPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;
    if (savedSession!.trialIndex >= currentIdx) return;

    trials.push({
      ...baseTrial,
      type: SurveyMultiChoicePlugin,
      questions: [
        {
          prompt: `
            <div class="sentence-container">
              <p class="test-prompt">
                ${item.sentence[lang].replace("...", "_______")}
              </p>
            </div>
          `,
          options: [
            item.option1[lang],
            item.option2[lang],
            i18next.t("options.new_sentence"),
          ],
          required: true,
        },
      ],
      button_label: i18next.t("buttons.confirm"),
      on_finish: (d) => {
        d.is_correct =
          d.response?.Q0 ===
          (item.item_type === "old"
            ? item.shownVersion
            : i18next.t("options.new_sentence"));
        updateSession(currentIdx, d);
      },
    });
  });
  return trials;
}