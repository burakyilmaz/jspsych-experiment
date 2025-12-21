import { createClient } from "@supabase/supabase-js";
import { GLOBAL_CONFIG } from "../config/constants";

export const supabase = createClient(
  GLOBAL_CONFIG.SUPABASE_URL,
  GLOBAL_CONFIG.SUPABASE_ANON_KEY
);
