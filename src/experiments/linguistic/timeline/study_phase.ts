import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";
import { LinguisticTestData } from "../../../types/interfaces";
// Tip güvenliği ve veri bütünlüğü için Enum importları
import { Condition, ExperimentPhase } from "../../../types/enums";

export function createStudyPhaseTimeline(
  learningPhaseStimuli: LinguisticTestData[],
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any,
  STUDY_SENTENCE_DELAY_MS: number
) {
  const trials: any[] = [];

  // ANALİZ GÜVENLİĞİ: Gecikme süresi konfigürasyonda eksikse varsayılan 2000ms tanımlıyoruz
  const delay = STUDY_SENTENCE_DELAY_MS || 2000;

  learningPhaseStimuli.forEach((item, i) => {
    const currentIdx = idx + i;

    // --- GRANÜLER OTURUM KURTARMA (RESUME) MANTIĞI ---
    // Eğer bu deneme indeksi daha önce tamamlanmadıysa timeline'a ekle
    if (!savedSession || savedSession.trialIndex < currentIdx) {
      trials.push({
        ...baseTrial,
        type: HtmlButtonResponsePlugin,
        stimulus: `
          <div class="sentence-container">
            <p class="study-sentence">
              ${item.sentence.replace("...", item.shownVersion!)}
            </p>
          </div>
        `,
        choices: [i18next.t("buttons.next")],
        // Katılımcının cümleyi okumadan geçmesini önlemek için buton gecikmesi
        enable_button_after: delay,

        on_finish: (d: any) => {
          // Evre bilgisi (Enum kullanımı: "encoding")
          d.phase = ExperimentPhase.ENCODING;
          d.item_id = item.id;

          // Condition belirleme (Direct vs Indirect)
          // Eğer stimuli_factory'den gelmişse onu kullanır, yoksa gösterilen versiyona göre atar
          d.condition =
            item.condition ||
            (item.shownVersion === item.option1
              ? Condition.DIRECT
              : Condition.INDIRECT);

          // Analiz sırasında katılımcının tam olarak ne gördüğünü teyit etmek için
          d.raw_sentence = item.sentence.replace("...", item.shownVersion!);

          // İlerlemeyi yerel depolamaya (localStorage) kaydet
          updateSession(currentIdx, d);
        },
      });
    }
  });

  return trials;
}
