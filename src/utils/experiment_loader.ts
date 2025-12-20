// src/utils/experiment_loader.ts
import { currentLang } from "./helpers";
import { getOrCreateSubjectId, SessionManager } from "./session_manager";
import { ParticipantGroup, Language } from "../types/enums";
import { SavedSession } from "../types/interfaces";

export function getExperimentContext<T>(expType: string) {
  const subject_id = getOrCreateSubjectId();
  const lang = currentLang() as Language;

  // Sadece 'group' parametresini çekiyoruz. 'exp' parametresi artık kabul edilmiyor.
  const params = new URLSearchParams(window.location.search);
  const groupParam = params.get("group");

  /**
   * 🛡️ STRICT VALIDATION:
   * Sadece 'group' parametresine bakılır.
   * Parametre eksikse veya enum değerlerine uymuyorsa geçersiz sayılır.
   */
  const isValid =
    groupParam === ParticipantGroup.STANDARD ||
    groupParam === ParticipantGroup.HERITAGE;

  if (!isValid) {
    return { isValid: false, lang, subject_id };
  }

  const group = groupParam as ParticipantGroup;
  let savedSession = SessionManager.load<SavedSession<T>>(expType, subject_id);

  /**
   * 🔐 OTURUM GÜVENLİĞİ:
   * Sadece grup değişirse (örn: standard -> heritage) oturumu temizle.
   * Dil kontrolünü burada yapmıyoruz çünkü startup.ts default olarak TR başlar.
   */
  if (savedSession && savedSession.group !== group) {
    SessionManager.clear(expType, subject_id);
    savedSession = null;
  }

  return { isValid: true, lang, group, subject_id, savedSession };
}
