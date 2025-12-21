import {
  VisualStimulusItem,
  VisualTestData,
  StimuliConfig,
} from "../../../types/interfaces";
import { ItemType, Condition, Language } from "../../../types/enums";
import { shuffleArray } from "../../../utils/helpers";

export function generateVisualStimuli(
  studyPool: VisualStimulusItem[],
  foilPool: VisualStimulusItem[],
  config: StimuliConfig & { participantNumber: number },
  availableImages: string[]
) {
  const {
    itemCountLearning,
    testOldCount,
    testNewCount,
    lang,
    participantNumber,
  } = config;

  const selectedStudyItems = shuffleArray(studyPool).slice(
    0,
    itemCountLearning
  );

  const learningPhaseStimuli: VisualTestData[] = selectedStudyItems.map(
    (item) => {
      const isDirect = (participantNumber + item.id) % 2 === 0;
      const conditionValue = isDirect ? Condition.DIRECT : Condition.INDIRECT;
      const idFormatted = String(item.id).padStart(2, "0");

      const searchPattern = `${idFormatted}_${item.action_key}_${conditionValue}_${item.gender}.jpg`;

      const actualPath = availableImages.find((path) =>
        path.toLowerCase().includes(searchPattern.toLowerCase())
      );

      if (!actualPath) {
        console.warn(`Asset bulunamadı: ${searchPattern}`);
      }

      return {
        id: item.id,
        image_path: actualPath || "undefined_fallback.jpg",
        sentence: lang === Language.TR ? item.tr : item.de,
        item_type: ItemType.OLD,
        condition: conditionValue,
        gender: item.gender,
      };
    }
  );

  const testOldItems = shuffleArray(learningPhaseStimuli).slice(
    0,
    testOldCount
  );

  const testNewItems: VisualTestData[] = shuffleArray(foilPool)
    .slice(0, testNewCount)
    .map((item) => ({
      id: item.id,
      sentence: lang === Language.TR ? item.tr : item.de,
      item_type: ItemType.NEW,
      condition: Condition.NEW_ITEM,
      gender: item.gender,
    }));

  return {
    learningPhaseStimuli,
    testPhaseStimuli: shuffleArray([...testOldItems, ...testNewItems]),
  };
}
