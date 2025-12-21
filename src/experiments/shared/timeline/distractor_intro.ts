import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { Phase } from "../../../types/enums";

export function createDistractorIntro(
  baseTrial: any,
  updateSession: any,
  idx: number
) {
  return {
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="distractor-intro">
        <h3>${i18next.t("distractor.title")}</h3>
        <p>${i18next.t("intro.distractor_phase")}</p>
      </div>
    `,
    choices: [i18next.t("buttons.next")],
    on_finish: (d: any) => {
      d.phase = Phase.SETUP;
      updateSession(idx, d);
    },
  };
}
