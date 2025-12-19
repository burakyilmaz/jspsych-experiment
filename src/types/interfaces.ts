interface RunOptions {
  assetPaths: {
    images: string[];
    audio: string[];
    video: string[];
  };
  input?: any;
  environment?: string;
  title?: string;
  version?: string;
  testType?: "linguistic" | "visual";
}

interface SentenceData {
  id: number;
  sentence: { tr: string; de: string };
  option1: { tr: string; de: string };
  option2: { tr: string; de: string };
  shownVersion?: string;
  item_type?: "old" | "new";
}

interface SavedSession {
  studyStimuli: SentenceData[];
  testStimuli: SentenceData[];
  trialIndex: number;
  trialData: any[];
}

interface StimuliConfig {
  itemCountLearning: number;
  testOldCount: number;
  testNewCount: number;
  lang: "tr" | "de";
}

interface StimulusItem {
  id: number;

  // Türkçe Veriler
  tr_stem: string;
  tr_direct: string;
  tr_indirect: string;

  // Almanca Veriler
  de_stem: string;
  de_direct: string;
  de_indirect: string;
}

interface StartupConfig {
  trResources: any;
  deResources: any;
}

export {
  RunOptions,
  SentenceData,
  SavedSession,
  StimuliConfig,
  StimulusItem,
  StartupConfig,
};
