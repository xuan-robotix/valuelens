/**
 * Supabase configuration guard.
 *
 * ValueLens runs fine with NO Supabase project configured — auth features simply
 * stay hidden and the app behaves exactly like the Phase 1 MVP. These helpers
 * are the single check the rest of the app uses to decide whether auth is on.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
