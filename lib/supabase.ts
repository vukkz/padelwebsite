import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service_role key.
 *
 * All database access in this app is server-side (route handlers + server
 * components). RLS is enabled on every table with no anon policies at all, so
 * the tables are unreachable except through this client. The anon key is never
 * shipped to the browser.
 *
 * The `server-only` import above turns an accidental client-component import
 * into a build error rather than a leaked service key.
 */

let cached: SupabaseClient | null = null;

export function serverClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Nedostaju Supabase env varijable. Podesite NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** True when Supabase credentials are present — used to show a setup hint instead of a crash. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Postgres error codes that mean "this slot is already taken". */
export const UNIQUE_VIOLATION = "23505";
export const EXCLUSION_VIOLATION = "23P01";

export function isSlotTakenError(code?: string | null): boolean {
  return code === UNIQUE_VIOLATION || code === EXCLUSION_VIOLATION;
}
