import "server-only";

import type { Database } from "./database.types";

import { createClient } from "@supabase/supabase-js";

import { publicSupabaseEnv } from "./public-env";

export function createTrustedSupabaseClient() {
  const { url } = publicSupabaseEnv();
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!key || key.startsWith("replace-with-")) {
    throw new Error("SUPABASE_SECRET_KEY is required on the server");
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
