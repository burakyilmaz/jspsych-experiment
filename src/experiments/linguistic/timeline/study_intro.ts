// study_intro.ts
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import i18next from "i18next";

export function createStudyIntroTimeline(
  baseTrial: any,
  updateSession: (idx: number, data: any) => void,
  idx: number,
  savedSession: any // Artık kullanılmasa da imza değişmesin diye kalabilir
) {
  // 🛡️ DÜZELTME: İçerideki if kontrolünü kaldırıyoruz.
  // Trial her zaman oluşturulmalı, slice onu zaten gerekirse atlayacak.
  return {
    ...baseTrial,
    type: HtmlButtonResponsePlugin,
    stimulus: `<p>${i18next.t("intro.study_phase")}</p>`,
    choices: [i18next.t("buttons.continue")],
    on_finish: (d: any) => updateSession(idx, d),
  };
}
