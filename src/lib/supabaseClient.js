import { createClient } from "@supabase/supabase-js";

// ============================================================
// AL MADINA RESTAURANT — Supabase Client
// URL and Publishable (anon) key come from environment variables
// so they are never hard-coded in the source. Set them in
// a local ".env.local" file (see .env.example).
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
