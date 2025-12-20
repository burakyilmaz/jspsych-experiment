import { SessionManager } from "../../../utils/session_manager";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import i18next from "i18next";

export function createCompletionTimeline(
  baseTrial: any,
  expType: string,
  subject_id: string
) {
  return {
    ...baseTrial,
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>${i18next.t("feedback.completion")}</p>`,
    choices: "NO_KEYS",
    on_start: (trial: any) => {
      // Önce baseTrial'daki ekran temizleme fonksiyonunu çalıştırıyoruz
      if (baseTrial.on_start) baseTrial.on_start(trial);
      // Ardından oturumu temizliyoruz
      SessionManager.clear(expType, subject_id);
    },
  };
}
