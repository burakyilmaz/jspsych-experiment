// src/utils/database.ts
import { ExperimentType, ParticipantGroup } from "../types/enums";
import { supabase } from "./supabaseClient";

/**
 * Katılımcıyı kaydeder ve ilgili deneye özel ardışık katılımcı numarasını döndürür.
 * Bu yapı, her deneyin (visual/linguistic) kendi içindeki dengeleme sırasını korur.
 */
export async function registerParticipant(
  lang: string,
  subject_id: string,
  exp_type: ExperimentType, // Enum zorunlu kılındı
  group: ParticipantGroup // Grup bilgisi eklendi
): Promise<number> {
  // 1. Oturum Kurtarma: Katılımcı zaten kayıtlı mı?
  const { data: existing } = await supabase
    .from("participant_sequences")
    .select("participant_number")
    .eq("subject_id", subject_id)
    .maybeSingle();

  if (existing) return Number(existing.participant_number);

  // 2. Akıllı ID Atama: Sadece ilgili deneyin TAMAMLANMIŞ olanlarını say
  // Bu filtreleme, Visual testindeki bir drop-out'un Linguistic testindeki sırayı bozmamasını sağlar.
  const { count } = await supabase
    .from("participant_sequences")
    .select("*", { count: "exact", head: true })
    .eq("experiment_type", exp_type) // Deney türüne göre filtrele
    .eq("is_completed", true); // Sadece bitirenleri baz al

  const nextBalancedNumber = (count || 0) + 1;

  // 3. Teknik metadata hazırlığı
  const ua = navigator.userAgent;
  const techData = {
    subject_id,
    lang,
    experiment_type: exp_type, // Analiz için hangi deney olduğu
    participant_group: group, // Analiz için hangi grup olduğu
    participant_number: nextBalancedNumber, // stimuli_factory'nin kullanacağı asıl numara
    is_completed: false, // Başlangıçta tamamlanmadı olarak işaretle
    browser_name: ua.includes("Chrome")
      ? "Chrome"
      : ua.includes("Firefox")
      ? "Firefox"
      : "Other",
    is_mobile: /Mobi|Android/i.test(ua),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
  };

  // 4. Veritabanına Ekle
  const { data, error } = await supabase
    .from("participant_sequences")
    .insert(techData)
    .select("participant_number")
    .single();

  if (error || !data) {
    console.error("Supabase Error:", error);
    throw new Error("participant_registration_failed");
  }

  return Number(data.participant_number);
}

/**
 * Deney başarıyla tamamlandığında katılımcıyı işaretler.
 * Bu fonksiyon çağrıldıktan sonra bu numara 'count' sorgusuna dahil edilir.
 */
export async function markParticipantAsCompleted(
  subject_id: string
): Promise<void> {
  const { error } = await supabase
    .from("participant_sequences")
    .update({ is_completed: true })
    .eq("subject_id", subject_id);

  if (error) {
    console.error("Could not mark participant as completed:", error);
  }
}
