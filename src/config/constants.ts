/**
 * Global Deney Ayarları
 */
export const GLOBAL_CONFIG = {
  CHECK_PREVIOUS_PARTICIPATION: false,
  STUDY_SENTENCE_DELAY_MS: 2000,
};

/**
 * DataPipe / OSF Experiment IDs
 */
export const DATAPIPE_IDS = {
  linguistic: {
    de: "yUSxzuv3Luor",
    tr: "n4hYLGlobOM4",
  },
  visual: {
    de: "1VVDbH7YRvlM",
    tr: "DzWRejvo7gHv",
  },
};

/**
 * Deney Bazlı Ayarlar
 */
export const EXPERIMENT_CONFIGS = {
  linguistic: {
    ITEM_COUNT_LEARNING: 4,
    TEST_OLD_COUNT: 2,
    TEST_NEW_COUNT: 2,
  },
  visual: {
    ITEM_COUNT_LEARNING: 6,
    TEST_OLD_COUNT: 3,
    TEST_NEW_COUNT: 3,
  }
};