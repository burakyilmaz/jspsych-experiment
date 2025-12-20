import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createWelcomeTimeline(
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any
) {
  if (savedSession!.trialIndex >= idx) return null;

  return {
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `<h1>${i18next.t("welcome")}</h1>`,
    choices: [i18next.t("buttons.start")],
    on_finish: (d: any) => updateSession(idx, d),
  };
}
