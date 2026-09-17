import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client-side public configurations
// NOTE: Only public anon / publishable key is used here. Service role keys MUST NEVER be exposed.
const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  "https://bpnladdupfaisfkweurx.supabase.co";

const supabaseAnonKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  "sb_publishable_-GQmEhhksBQqojzlB0Rg9A_HlMgAint";

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-id")
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
