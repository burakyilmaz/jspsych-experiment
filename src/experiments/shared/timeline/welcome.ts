// src/experiments/shared/timeline/welcome.ts
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createWelcomeTimeline(
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  _savedSession: any // Artık içeride kontrol yapmıyoruz
) {
  // 🛡️ DÜZELTME: if kontrolü ve return null kaldırıldı.
  // İndeks bütünlüğü için trial her zaman oluşturulmalı.
  return {
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <div class="welcome-container">
        <h1>${i18next.t("welcome")}</h1>
        <p>${i18next.t("intro.survey_finished")}</p>
        <div class="welcome-divider"></div>
        <p><strong>${i18next.t("intro.welcome_task")}</strong></p>
      </div>
    `,
    choices: [i18next.t("buttons.start_experiment")],
    on_finish: (d: any) => updateSession(idx, d),
  };
}
