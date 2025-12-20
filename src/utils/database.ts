// src/utils/database.ts
import { supabase } from "./supabaseClient";

export async function registerParticipant(
  lang: string,
  subject_id: string
): Promise<number> {
  // 1. Zaten kayıtlı mı?
  const { data: existing } = await supabase
    .from("participant_sequences")
    .select("id")
    .eq("subject_id", subject_id)
    .maybeSingle();

  if (existing) return Number(existing.id);

  // 2. Teknik metadata
  const ua = navigator.userAgent;
  const techData = {
    subject_id,
    lang,
    browser_name: ua.includes("Chrome")
      ? "Chrome"
      : ua.includes("Firefox")
      ? "Firefox"
      : "Other",
    is_mobile: /Mobi|Android/i.test(ua),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
  };

  // 3. Insert
  const { data, error } = await supabase
    .from("participant_sequences")
    .insert(techData)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("participant_registration_failed");
  }

  return Number(data.id);
}
