import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { Language } from "../../../types/enums";

export function createLanguageSelectionTimeline(jsPsych: any) {
  return {
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="lang-selection-container">
        <h2>Lütfen Dil Seçiniz / Bitte wählen Sie eine Sprache</h2>
      </div>
    `,
    choices: ["Türkçe", "Deutsch"],
    on_finish: (data: any) => {
      const selectedLang = data.response === 0 ? Language.TR : Language.DE;

      data.lang = selectedLang;

      i18next.changeLanguage(selectedLang);

      jsPsych.data.addProperties({ lang: selectedLang });
    },
  };
}
