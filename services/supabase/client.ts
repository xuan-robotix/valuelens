"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Browser-side Supabase client. Call only when auth is configured. */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
