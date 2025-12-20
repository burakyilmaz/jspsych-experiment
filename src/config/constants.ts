/**
 * Global Deney Ayarları
 */
export const GLOBAL_CONFIG = {
  CHECK_PREVIOUS_PARTICIPATION: false,
  STUDY_PHASE_DELAY_MS: 2000,
  SUPABASE_URL: "https://sbkcqywkaezyqpilktpn.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_XcxxH7-0FhA4vlMroFvt6Q_BxtlJZE2",
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
    ITEM_COUNT_LEARNING: 4,
    TEST_OLD_COUNT: 2,
    TEST_NEW_COUNT: 2,
  },
};
