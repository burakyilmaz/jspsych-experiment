import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { SentenceData } from "../../../types/interfaces";

export function createStudyPhaseTimeline(
  learningPhaseStimuli: SentenceData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any,
  lang: "tr" | "de",
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
            ${item.sentence[lang].replace("...", item.shownVersion!)}
          </p>
        </div>
      `,
      choices: [i18next.t("buttons.next")],
      enable_button_after: STUDY_SENTENCE_DELAY_MS,
      on_finish: (d) => updateSession(currentIdx, d),
    });
  });
  return trials;
}