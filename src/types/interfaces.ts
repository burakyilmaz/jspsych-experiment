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

export { RunOptions, SentenceData, SavedSession };
