import "server-only";

import type { Database } from "./database.types";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicSupabaseEnv } from "./public-env";

export async function createRequestSupabaseClient() {
  const { url, key } = publicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          for (const { name, value, options } of items)
            cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies; a request handler must refresh sessions.
        }
      },
    },
  });
}
