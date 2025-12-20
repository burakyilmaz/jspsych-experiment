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
    data_string: () => jsPsych.data.get().json(),
    on_load: () => {
      // Kayıt sırasında kullanıcıya görsel bir geri bildirim veriyoruz
      jsPsych.getDisplayElement().innerHTML = `
        <div style="text-align:center">
          <p>${i18next.t("feedback.saving_data")}</p>
          <div class="spinner"></div>
        </div>
      `;
    },
    on_finish: async () => {
      await markParticipantAsCompleted(subject_id);
      SessionManager.setCompleted(expType);
      jsPsych.getDisplayElement().innerHTML = ""; // Ekranı temizle
    },
  };
}
