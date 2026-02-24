import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Whether Supabase environment variables are configured. */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/** Supabase client singleton. Only usable when `isSupabaseConfigured` is true. */
export const supabase =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
