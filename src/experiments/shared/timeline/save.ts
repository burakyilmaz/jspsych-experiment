// src/experiments/shared/timeline/save.ts
import jsPsychPipe from "@jspsych-contrib/plugin-pipe";
import i18next from "i18next";
import { SessionManager } from "../../../utils/session_manager";
import { markParticipantAsCompleted } from "../../../utils/database";

export function createSaveTimeline(
  subject_id: string,
  jsPsych: any,
  expType: string,
  experimentId: string
) {
  return {
    type: jsPsychPipe,
    action: "save",
    experiment_id: experimentId,
    filename: `${subject_id}.json`,
    // 🛡️ DÜZELTME: Sadece 'experiment_type' sütununa sahip satırları gönder
    // Bu sayede dil seçimi gibi global özellikleri olmayan ilk trial'lar DataPipe'a gitmez ve hata vermez.
    data_string: () => {
      const filteredData = jsPsych.data
        .get()
        .filter({ experiment_type: expType });

      if (filteredData.count() === 0) {
        console.error(
          "KRİTİK HATA: DataPipe'a gönderilecek veri bulunamadı! Filtreleme başarısız."
        );
      }

      return filteredData.json();
    },
    on_load: () => {
      jsPsych.getDisplayElement().innerHTML = `
        <div style="text-align:center">
          <p>${i18next.t("feedback.saving_data")}</p>
          <div class="spinner"></div>
        </div>
      `;
    },
    on_finish: async () => {
      await markParticipantAsCompleted(subject_id, expType);
      SessionManager.setCompleted(expType);
      jsPsych.getDisplayElement().innerHTML = "";
    },
  };
}
