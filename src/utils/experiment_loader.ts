import { currentLang } from "./helpers";
import { getOrCreateSubjectId, SessionManager } from "./session_manager";
import { DATAPIPE_IDS } from "../config/constants";
import { ParticipantGroup, Language } from "../types/enums";
import { SavedSession } from "../types/interfaces";

export function getExperimentContext<T>(expType: string) {
  const subject_id = getOrCreateSubjectId();
  const lang = currentLang() as Language;

  const params = new URLSearchParams(window.location.search);
  const groupParam = params.get("group");

  const isValid =
    groupParam === ParticipantGroup.STANDARD ||
    groupParam === ParticipantGroup.HERITAGE;

  if (!isValid) {
    return {
      isValid: false,
      lang,
      subject_id,
      group: null,
      activeDataPipeId: null,
      savedSession: null,
    };
  }

  const group = groupParam as ParticipantGroup;
  let savedSession = SessionManager.load<SavedSession<T>>(expType, subject_id);

  if (savedSession && savedSession.group !== group) {
    SessionManager.clear(expType, subject_id);
    savedSession = null;
  }

  const activeDataPipeId = lang ? (DATAPIPE_IDS as any)[expType][lang] : null;

  return {
    isValid: true,
    lang,
    group,
    subject_id,
    activeDataPipeId,
    savedSession,
  };
}
