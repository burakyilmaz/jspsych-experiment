import { VisualTestData } from "../../../types/interfaces";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createStudyPhaseTimeline(
  learningPhaseStimuli: VisualTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any,
  STUDY_IMAGE_DELAY_MS: number
) {
  const trials: any[] = [];

  learningPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;
    if (savedSession!.trialIndex >= currentIdx) return;

    trials.push({
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `
        <div class="visual-container">
          <img src="${item.image_path}" class="study-image" style="max-width: 800px;" />
        </div>
      `,
      choices: [i18next.t("buttons.next")],
      enable_button_after: STUDY_IMAGE_DELAY_MS,
      on_finish: (d: any) => {
        d.phase = "encoding";
        d.item_id = item.id;
        d.condition = item.condition; // direct | indirect
        updateSession(currentIdx, d);
      },
    });
  });

  return trials;
}
