import { ExperimentType, ItemType, Condition, Language, Gender } from "./enums";

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
  testType?: ExperimentType; // Enum kullanıldı
}

/**
 * Dilsel (Linguistic) Deney İçin Veri Yapıları
 */
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
  item_type: ItemType; // Enum kullanıldı
  shownVersion?: string;
  condition?: Condition; // Enum kullanıldı
}

/**
 * Görsel (Visual) Deney İçin Veri Yapıları
 */
export interface VisualStimulusItem {
  id: number;
  tr: string;
  de: string;
  action_key: string;
  gender: Gender; // Enum kullanıldı
}

export interface VisualTestData {
  id: number;
  image_path?: string;
  sentence: string;
  item_type: ItemType; // Enum kullanıldı
  condition?: Condition; // Enum kullanıldı
  gender: Gender; // Enum kullanıldı
}

/**
 * Oturum Yönetimi ve Genel Konfigürasyonlar
 */
export interface SavedSession<T = LinguisticTestData | VisualTestData> {
  studyStimuli: T[];
  testStimuli: T[];
  trialIndex: number;
  trialData: any[];
  participantNumber: number;
}

export interface StimuliConfig {
  itemCountLearning: number;
  testOldCount: number;
  testNewCount: number;
  lang: Language; // Enum kullanıldı
}
