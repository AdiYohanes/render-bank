"use client";

import type { Database } from "./database.types";

import { createBrowserClient } from "@supabase/ssr";

import { publicSupabaseEnv } from "./public-env";

export function createBrowserSupabaseClient() {
  const { url, key } = publicSupabaseEnv();

  return createBrowserClient<Database>(url, key);
}
