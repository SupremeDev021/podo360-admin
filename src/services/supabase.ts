import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isValidPublicKey(value?: string) {
  if (!value) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return false;
  return value.length > 20;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && isValidPublicKey(supabaseAnonKey));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
