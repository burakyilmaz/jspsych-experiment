import { createClient } from "@supabase/supabase-js";
import { GLOBAL_CONFIG } from "../config/constants";

// constants.ts içine SUPABASE_URL ve SUPABASE_KEY eklemelisin
export const supabase = createClient(
  GLOBAL_CONFIG.SUPABASE_URL,
  GLOBAL_CONFIG.SUPABASE_ANON_KEY
);
