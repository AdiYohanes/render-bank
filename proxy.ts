import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { publicSupabaseEnv } from "@/lib/supabase/public-env";

export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice("/prompts/".length);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.next();
  const { url, key } = publicSupabaseEnv();
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.from("prompt_slug_redirects")
    .select("prompt:prompts!inner(slug,status)").eq("old_slug", slug).eq("prompt.status", "PUBLISHED").maybeSingle();
  if (error || !data?.prompt) return NextResponse.next();
  const destination = request.nextUrl.clone();
  destination.pathname = `/prompts/${data.prompt.slug}`;
  destination.search = "";
  return NextResponse.redirect(destination, 301);
}

export const config = { matcher: "/prompts/:slug" };
