import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { LinguisticTestData } from "../../../types/interfaces";
import { Condition, ExperimentPhase } from "../../../types/enums";

export function createStudyPhaseTimeline(
  learningPhaseStimuli: LinguisticTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  _savedSession: any,
  STUDY_SENTENCE_DELAY_MS: number
) {
  const trials: any[] = [];
  const delay = STUDY_SENTENCE_DELAY_MS || 2000;

  learningPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;

    trials.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="sentence-container">
          <p class="study-sentence">
            ${item.sentence.replace("...", item.shownVersion!)}
          </p>
        </div>
      `,
      choices: [i18next.t("buttons.next")],
      enable_button_after: delay,
      on_finish: (d: any) => {
        d.phase = ExperimentPhase.ENCODING;
        d.item_id = item.id;
        d.condition =
          item.condition ||
          (item.shownVersion === item.option1
            ? Condition.DIRECT
            : Condition.INDIRECT);
        d.raw_sentence = item.sentence.replace("...", item.shownVersion!);

        updateSession(currentIdx, d);
      },
    });
  });

  return trials;
}
