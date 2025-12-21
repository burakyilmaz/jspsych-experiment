export function getOrCreateSubjectId(): string {
  let subject_id = localStorage.getItem("subject_id");
  if (!subject_id) {
    subject_id = Math.random().toString(36).substring(2, 12);
    localStorage.setItem("subject_id", subject_id);
  }
  return subject_id;
}

function getSessionKey(expType: string, subject_id: string): string {
  return `jspsych_resume_${expType}_${subject_id}`;
}

function getStatusKey(expType: string): string {
  return `experiment_status_${expType}`;
}

export const SessionManager = {
  load: <T>(expType: string, subject_id: string): T | null => {
    const key = getSessionKey(expType, subject_id);
    const savedRaw = localStorage.getItem(key);
    return savedRaw ? JSON.parse(savedRaw) : null;
  },

  save: <T>(expType: string, subject_id: string, data: T): void => {
    const key = getSessionKey(expType, subject_id);
    localStorage.setItem(key, JSON.stringify(data));
  },

  updateProgress: <T extends { trialIndex: number; trialData: any[] }>(
    expType: string,
    subject_id: string,
    session: T,
    idx: number,
    data: any
  ): void => {
    session.trialIndex = idx;
    session.trialData.push(data);
    const key = getSessionKey(expType, subject_id);
    localStorage.setItem(key, JSON.stringify(session));
  },

  clear: (expType: string, subject_id: string): void => {
    const key = getSessionKey(expType, subject_id);
    localStorage.removeItem(key);
  },

  setCompleted: (expType: string): void => {
    localStorage.setItem(getStatusKey(expType), "completed");
  },

  isCompleted: (expType: string): boolean => {
    return localStorage.getItem(getStatusKey(expType)) === "completed";
  },
};
