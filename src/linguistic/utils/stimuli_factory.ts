import { shuffleArray } from "../../utils/helpers";
import { StimuliConfig, StimulusItem } from "../../types/interfaces";

export function generateLinguisticStimuli(
  studyPool: StimulusItem[],
  foilPool: StimulusItem[],
  config: StimuliConfig
) {
  const { itemCountLearning, testOldCount, testNewCount, lang } = config;

  // 1. Study Havuzunu Karıştır ve Öğrenme İtemlerini Seç
  const shuffledStudyPool = shuffleArray(studyPool);

  const learningPhaseStimuli = shuffledStudyPool
    .slice(0, itemCountLearning)
    .map((item) => {
      // Rastgele bir versiyon seç (Direct veya Indirect)
      const isDirect = Math.random() < 0.5;
      const shown = isDirect
        ? lang === "tr"
          ? item.tr_direct
          : item.de_direct
        : lang === "tr"
        ? item.tr_indirect
        : item.de_indirect;

      return {
        id: item.id,
        sentence: { tr: item.tr_stem, de: item.de_stem },
        option1: { tr: item.tr_direct, de: item.de_direct },
        option2: { tr: item.tr_indirect, de: item.de_indirect },
        item_type: "old" as const,
        shownVersion: shown,
      };
    });

  // 2. Test Havuzu İçin "Eski" İtemleri Seç (Öğrenilenlerden)
  const testOldItems = shuffleArray(learningPhaseStimuli).slice(
    0,
    testOldCount
  );

  // 3. Test Havuzu İçin "Yeni" İtemleri Seç (Foil/Tuzak listesinden)
  const testNewItems = shuffleArray(foilPool)
    .slice(0, testNewCount)
    .map((item) => ({
      id: item.id,
      sentence: { tr: item.tr_stem, de: item.de_stem },
      option1: { tr: item.tr_direct, de: item.de_direct },
      option2: { tr: item.tr_indirect, de: item.de_indirect },
      item_type: "new" as const,
    }));

  // 4. Test Listesini Birleştir ve Karıştır
  const testPhaseStimuli = shuffleArray([...testOldItems, ...testNewItems]);

  return {
    learningPhaseStimuli,
    testPhaseStimuli,
  };
}
