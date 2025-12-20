// src/experiments/linguistic/timeline/study_phase.ts
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { LinguisticTestData } from "../../../types/interfaces";
import { Condition, ExperimentPhase } from "../../../types/enums"; // Enumları ekledik

export function createStudyPhaseTimeline(
  learningPhaseStimuli: LinguisticTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any,
  STUDY_SENTENCE_DELAY_MS: number
) {
  const trials: any[] = [];
  learningPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;
    if (savedSession!.trialIndex >= currentIdx) return;

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
      enable_button_after: STUDY_SENTENCE_DELAY_MS,
      on_finish: (d: any) => {
        d.phase = ExperimentPhase.ENCODING; // Enum kullanımı
        d.item_id = item.id;
        // Condition belirleme mantığı
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
