import { createClient } from '@supabase/supabase-js'
import config from "../config/config";

console.log(config.DATABASE_URL, config.DATABASE_KEY)

export const supabase = createClient(config.DATABASE_URL!, config.DATABASE_KEY!);