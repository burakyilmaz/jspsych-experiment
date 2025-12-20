import jsPsychPreload from "@jspsych/plugin-preload";
import i18next from "i18next";

export function createPreloadTimeline(imageFiles: string[]) {
  return {
    type: jsPsychPreload,
    images: imageFiles, // Manuel olarak listeyi veriyoruz
    auto_preload: false, // HTML string kullandığımız için otomatiği kapatıyoruz
    message: i18next.t("preload.loading"), // "Lütfen bekleyin..." mesajı
    error_message: i18next.t("preload.error"), // "Yükleme hatası" mesajı
    show_detailed_errors: true, // Hangi resmin hatalı olduğunu görmek için
    max_load_time: 30000, // 30 saniye limit
    on_error: (file: string) => {
      console.error("Yüklenemeyen dosya:", file);
    },
  };
}
