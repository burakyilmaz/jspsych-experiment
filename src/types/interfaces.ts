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
  tr_sentence: string;
  tr_option1: string;
  tr_option2: string;
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
