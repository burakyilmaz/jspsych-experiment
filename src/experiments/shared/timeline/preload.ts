import jsPsychPreload from "@jspsych/plugin-preload";
import i18next from "i18next";

export function createPreloadTimeline(imageFiles: string[]) {
  return {
    type: jsPsychPreload,
    images: imageFiles,
    auto_preload: false,
    message: i18next.t("preload.loading"),
    error_message: i18next.t("preload.error"),
    show_detailed_errors: true,
    max_load_time: 30000,
    on_error: (file: string) => {
      console.error("Yüklenemeyen dosya:", file);
    },
  };
}
