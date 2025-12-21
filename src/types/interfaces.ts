import {
  ExperimentType,
  ItemType,
  Condition,
  Language,
  Gender,
  ParticipantGroup,
} from "./enums";

export interface StartupConfig {
  trResources: any;
  deResources: any;
}

export interface RunOptions {
  assetPaths: {
    images: string[];
    audio: string[];
    video: string[];
  };
  input?: any;
  environment?: string;
  title?: string;
  version?: string;
  testType?: ExperimentType;
}

export interface LinguisticStimulusItem {
  id: number;
  tr_stem: string;
  tr_direct: string;
  tr_indirect: string;
  de_stem: string;
  de_direct: string;
  de_indirect: string;
}

export interface LinguisticTestData {
  id: number;
  sentence: string;
  option1: string;
  option2: string;
  item_type: ItemType;
  shownVersion?: string;
  condition?: Condition;
}

export interface VisualStimulusItem {
  id: number;
  tr: string;
  de: string;
  action_key: string;
  gender: Gender;
}

export interface VisualTestData {
  id: number;
  image_path?: string;
  sentence: string;
  item_type: ItemType;
  condition?: Condition;
  gender: Gender;
}

export interface SavedSession<T = LinguisticTestData | VisualTestData> {
  studyStimuli: T[];
  testStimuli: T[];
  trialIndex: number;
  trialData: any[];
  participantNumber: number;
  lang: Language;
  group: ParticipantGroup;
}

export interface StimuliConfig {
  itemCountLearning: number;
  testOldCount: number;
  testNewCount: number;
  lang: Language;
}
