import { ExperimentType, ParticipantGroup } from "../types/enums";
import { supabase } from "./supabaseClient";

export async function registerParticipant(
  lang: string,
  subject_id: string,
  exp_type: ExperimentType,
  group: ParticipantGroup
): Promise<number> {
  const { data: existing } = await supabase
    .from("participant_sequences")
    .select("participant_number")
    .eq("subject_id", subject_id)
    .eq("experiment_type", exp_type)
    .maybeSingle();

  if (existing) return Number(existing.participant_number);

  const { count } = await supabase
    .from("participant_sequences")
    .select("*", { count: "exact", head: true })
    .eq("experiment_type", exp_type)
    .eq("is_completed", true);

  const nextBalancedNumber = (count || 0) + 1;
  const ua = navigator.userAgent;
  const techData = {
    subject_id,
    lang,
    experiment_type: exp_type,
    participant_group: group,
    participant_number: nextBalancedNumber,
    is_completed: false,
    browser_name: ua.includes("Chrome")
      ? "Chrome"
      : ua.includes("Firefox")
      ? "Firefox"
      : "Other",
    is_mobile: /Mobi|Android/i.test(ua),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
  };

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

export async function markParticipantAsCompleted(
  subject_id: string,
  exp_type: string
): Promise<void> {
  const { error } = await supabase
    .from("participant_sequences")
    .update({ is_completed: true })
    .eq("subject_id", subject_id)
    .eq("experiment_type", exp_type);

  if (error) {
    console.error("Could not mark participant as completed:", error);
  }
}
