import { createClient } from "@supabase/supabase-js";

import config from "../config/config";

/**
 * Initializes and exports the Supabase client.
 *
 * This client is used to interact with the Supabase backend services.
 * The client is configured using the Supabase URL and API key from the config file.
 */
export const supabase = createClient(
  config.DATABASE_URL!,
  config.DATABASE_KEY!,
);

/**
 * Initializes and exports the Supabase course client.
 *
 * This client is used to interact with the Supabase backend services for the course schema.
 * The client is configured using the Supabase URL and API key from the config file.
 */
export const supabaseCourseClient = createClient(
  config.DATABASE_URL!,
  config.DATABASE_KEY!,
  { db: { schema: "course" } },
);

console.log("Connected to Supabase Client!");
