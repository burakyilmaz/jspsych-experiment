import jsPsychPipe from "@jspsych-contrib/plugin-pipe";
import i18next from "i18next";
import { SessionManager } from "../../utils/session_manager";

export function createSaveTimeline(
  subject_id: string,
  jsPsych: any,
  expType: string,
  experimentId: string // Yeni parametre
) {
  return {
    type: jsPsychPipe,
    action: "save",
    experiment_id: experimentId, // Dinamik ID
    filename: `${subject_id}.json`,
    data_string: () => jsPsych.data.get().json(),
    on_load: () => {
      jsPsych.getDisplayElement().innerHTML = `
        <div style="text-align:center">
          <p>${i18next.t("feedback.saving_data")}</p>
          <div class="spinner"></div>
        </div>
      `;
    },
    on_finish: () => {
      SessionManager.setCompleted(expType);
    },
  };
}
