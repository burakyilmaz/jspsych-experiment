// src/experiments/linguistic/utils/stimuli_factory.ts

import { shuffleArray } from "../../../utils/helpers";
import {
  LinguisticStimulusItem,
  LinguisticTestData,
  StimuliConfig,
} from "../../../types/interfaces";
import { ItemType, Condition, Language } from "../../../types/enums";

export function generateLinguisticStimuli(
  studyPool: LinguisticStimulusItem[],
  foilPool: LinguisticStimulusItem[],
  config: StimuliConfig & { participantNumber: number }
) {
  const {
    itemCountLearning,
    testOldCount,
    testNewCount,
    lang,
    participantNumber,
  } = config;

  const shuffledStudyPool = shuffleArray(studyPool);

  // 1. ÖĞRENME AŞAMASI (Encoding)
  const learningPhaseStimuli: LinguisticTestData[] = shuffledStudyPool
    .slice(0, itemCountLearning)
    .map((item) => {
      const stem = lang === Language.TR ? item.tr_stem : item.de_stem;
      const opt1 = lang === Language.TR ? item.tr_direct : item.de_direct;
      const opt2 = lang === Language.TR ? item.tr_indirect : item.de_indirect;

      // DENGELEME FORMÜLÜ: (Katılımcı No + Madde ID) % 2
      const isDirect = (participantNumber + item.id) % 2 === 0;
      const shown = isDirect ? opt1 : opt2;

      return {
        id: item.id,
        sentence: stem,
        option1: opt1,
        option2: opt2,
        item_type: ItemType.OLD, // "old" yerine
        shownVersion: shown,
        condition: isDirect ? Condition.DIRECT : Condition.INDIRECT, // "direct" yerine
      };
    });

  // 2. TEST AŞAMASI (Retrieval) - Eski İtemler
  // Eski maddeleri karıştırıp istenen sayı kadarını test havuzuna alıyoruz
  const testOldItems = shuffleArray(learningPhaseStimuli).slice(
    0,
    testOldCount
  );

  // 3. TEST AŞAMASI (Retrieval) - Yeni (Foil) İtemler
  const testNewItems: LinguisticTestData[] = shuffleArray(foilPool)
    .slice(0, testNewCount)
    .map((item) => ({
      id: item.id,
      sentence: lang === Language.TR ? item.tr_stem : item.de_stem,
      option1: lang === Language.TR ? item.tr_direct : item.de_direct,
      option2: lang === Language.TR ? item.tr_indirect : item.de_indirect,
      item_type: ItemType.NEW, // "new" yerine
      condition: Condition.NEW_ITEM,
    }));

  return {
    learningPhaseStimuli,
    testPhaseStimuli: shuffleArray([...testOldItems, ...testNewItems]),
  };
}
