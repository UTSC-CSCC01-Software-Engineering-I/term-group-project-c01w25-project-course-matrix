import { createClient } from '@supabase/supabase-js'
import config from "../config/config";

export const supabase = createClient(config.DATABASE_URL!, config.DATABASE_KEY!);

console.log("Connected to Supabase Client!")