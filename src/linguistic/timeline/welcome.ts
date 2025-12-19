import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createWelcomeTimeline(baseTrial: any, updateSession: (idx: number, data: any) => void, idx: number, savedSession: any) {
  if (savedSession.trialIndex < idx) {
    return {
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("welcome")}</p>`,
      choices: [i18next.t("buttons.start")],
      on_finish: (d) => updateSession(idx, d),
    };
  }
  return null;
}