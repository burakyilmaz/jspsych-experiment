// src/experiments/shared/timeline/language_selection.ts
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { Language } from "../../../types/enums";

/**
 * Deneyin en başında TR/DE seçimi yaptıran ekran.
 */
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
      /**
       * 🔍 DÜZELTME 1: jsPsych 7+ sürümünde buton indeksi 'response' içindedir.
       * data.button_pressed kullanımı eski sürümlerde (v6) kaldı.
       */
      const selectedLang = data.response === 0 ? Language.TR : Language.DE;

      // jsPsych verisine seçilen dili mühürleyelim (run fonksiyonu buradan okuyacak)
      data.lang = selectedLang;

      // i18next dilini anlık olarak değiştir (Arayüz metinleri için)
      i18next.changeLanguage(selectedLang);

      /**
       * 🔍 DÜZELTME 2: Global veriyi burada mühürlemek yerine,
       * ana run fonksiyonunda stimuli üretildikten sonra mühürlemek daha güvenlidir.
       * Ama yine de anlık etki için ekliyoruz:
       */
      jsPsych.data.addProperties({ lang: selectedLang });
    },
  };
}
