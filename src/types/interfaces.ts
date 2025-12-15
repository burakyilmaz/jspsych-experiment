// --- TİP TANIMLAMALARI ---
// Bu arayüz (Interface) gelen parametrelerin neye benzediğini tanımlar
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
  testType?: 'linguistic' | 'visual';
}

// linguisticData içindeki nesnelerin yapısını tanımlayabilirsin (İsteğe bağlı ama önerilir)
interface SentenceData {
  id: number;
  tr_sentence: string;
  tr_option1: string;
  tr_option2: string;
  shownVersion?: string; // Kod içinde sonradan eklediğimiz alan
  // Diğer alanlar...
}

export { RunOptions, SentenceData };