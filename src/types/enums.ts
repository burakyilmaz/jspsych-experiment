export enum ExperimentType {
  LINGUISTIC = "linguistic",
  VISUAL = "visual",
}

export enum ItemType {
  OLD = "old",
  NEW = "new",
}

export enum Condition {
  DIRECT = "direct",
  INDIRECT = "indirect",
  NEW_ITEM = "new_item",
}

export enum Language {
  TR = "tr",
  DE = "de",
}

export enum Gender {
  FEMALE = "f",
  MALE = "m",
}

export enum PerformanceCategory {
  HIT = "Hit",
  MISS = "Miss",
  SOURCE_ERROR = "Source Error",
  CORRECT_REJECTION = "Correct Rejection",
  FALSE_ALARM = "False Alarm",
}

export enum ErrorType {
  FORGETTING = "forgetting",
  TENSE_MISMATCH = "tense_mismatch",
  FALSE_MEMORY = "false_memory",
  SOURCE_MISATTRIBUTION = "source_misattribution",
  PHANTOM_SOURCE = "phantom_source",
}

export enum ExperimentPhase {
  ENCODING = "encoding",
  RETRIEVAL = "retrieval",
  RETRIEVAL_RECOGNITION = "retrieval_recognition",
  RETRIEVAL_SOURCE = "retrieval_source",
}

export enum ParticipantGroup {
  STANDARD = "standard",
  HERITAGE = "heritage",
}

export enum Phase {
  SETUP = "setup",
  DISTRACTOR = "distractor",
  ENCODING = "encoding",
  RETRIEVAL = "retrieval",
  SAVE = "save",
}

export enum TaskName {
  DISTRACTOR = "distractor",
  LINGUISTIC = "linguistic",
  VISUAL = "visual",
}
