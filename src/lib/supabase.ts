import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "FATAL: Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
}

// Export a singleton instance of the database client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);