import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createTestIntroTimeline(baseTrial: any, updateSession: (idx: number, data: any) => void, idx: number, savedSession: any) {
  if (savedSession.trialIndex < idx) {
    return {
      ...baseTrial,
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${i18next.t("intro.test_phase")}</p>`,
      choices: [i18next.t("buttons.start_test")],
      on_finish: (d) => updateSession(idx, d),
    };
  }
  return null;
}