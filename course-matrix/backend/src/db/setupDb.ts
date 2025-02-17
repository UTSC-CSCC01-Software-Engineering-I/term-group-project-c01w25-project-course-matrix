import { createClient } from "@supabase/supabase-js";

import config from "../config/config";

export const supabase = createClient(
  config.DATABASE_URL!,
  config.DATABASE_KEY!,
);

export const supabaseCourseClient = createClient(
  config.DATABASE_URL!,
  config.DATABASE_KEY!,
  { db: { schema: "course" } },
);

console.log("Connected to Supabase Client!");
