const IS_TEST_MODE = false;

export const GLOBAL_CONFIG = {
  CHECK_PREVIOUS_PARTICIPATION: false,
  SUPABASE_URL: "https://sbkcqywkaezyqpilktpn.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_XcxxH7-0FhA4vlMroFvt6Q_BxtlJZE2",
  MAX_PRELOAD_TIME_MS: 30000,
  THEME_STORAGE_KEY: "theme",
};

export const TIMING_CONFIG = {
  FIXATION_DURATION_MS: IS_TEST_MODE ? 100 : 500,
  STUDY_DELAY_LINGUISTIC: IS_TEST_MODE ? 500 : 2000,
  STUDY_DELAY_VISUAL: IS_TEST_MODE ? 500 : 3000,
  WELCOME_SCREEN_DURATION: IS_TEST_MODE ? 500 : 5000,
  DISTRACTOR_TRIAL_LIMIT: IS_TEST_MODE ? 1000 : 5000,
};

export const DISTRACTOR_CONFIG = {
  TRIAL_COUNT: IS_TEST_MODE ? 4 : 40,
  KEYS: ["f", "j"],
  NUMBER_RANGE: { MIN: 1, MAX: 99 },
};

export const EXPERIMENT_CONFIGS = {
  linguistic: {
    ITEM_COUNT_LEARNING: IS_TEST_MODE ? 4 : 20,
    TEST_OLD_COUNT: IS_TEST_MODE ? 2 : 10,
    TEST_NEW_COUNT: IS_TEST_MODE ? 2 : 10,
  },
  visual: {
    ITEM_COUNT_LEARNING: IS_TEST_MODE ? 4 : 20,
    TEST_OLD_COUNT: IS_TEST_MODE ? 2 : 10,
    TEST_NEW_COUNT: IS_TEST_MODE ? 2 : 10,
  },
};

export const DATAPIPE_IDS = {
  linguistic: { de: "yUSxzuv3Luor", tr: "n4hYLGlobOM4" },
  visual: { de: "1VVDbH7YRvlM", tr: "DzWRejvo7gHv" },
};

console.log(
  `%c Experiment Mode: ${IS_TEST_MODE ? "TEST" : "PRODUCTION"} `,
  "background: #222; color: #bada55"
);
