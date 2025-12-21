import { VisualTestData } from "../../../types/interfaces";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
// 🛡️ Enum'ları dahil ediyoruz
import { ExperimentPhase } from "../../../types/enums";

export function createStudyPhaseTimeline(
  learningPhaseStimuli: VisualTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  _session: any,
  STUDY_IMAGE_DELAY_MS: number
) {
  return learningPhaseStimuli.map((item, i) => {
    const currentIdx = idx + i;
    return {
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
        // 🛡️ Hardcoded string yerine Enum kullanıyoruz
        d.phase = ExperimentPhase.ENCODING;
        d.item_id = item.id;

        // item.condition zaten "direct" | "indirect" değerlerini Enum.Condition'dan alıyor olmalı
        d.condition = item.condition;

        updateSession(currentIdx, d);
      },
    };
  });
}
