import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createStudyIntroTimeline(
  baseTrial: any,
  updateSession: any,
  idx: number,
  _session: any
) {
  return {
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `<p>${i18next.t("intro.visual_study_phase")}</p>`,
    choices: [i18next.t("buttons.start")],
    on_finish: (d: any) => updateSession(idx, d),
  };
}
