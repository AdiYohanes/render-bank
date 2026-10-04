import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createRequestSupabaseClient } from "@/lib/supabase/server";

export const activeAdmin = cache(async () => {
  const client = await createRequestSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await client.from("admin_profiles").select("display_name,role,is_active").eq("user_id", user.id).maybeSingle();
  return profile?.is_active ? { user, profile, client } : null;
});

export async function requireAdmin() {
  const admin = await activeAdmin();
  if (!admin) redirect("/admin/login?expired=1");
  return admin;
}

export function safeAdminNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return /^\/admin\/(?!login(?:\/|$))[a-z0-9/_-]*(?:\?[a-z0-9=&_-]+)?$/i.test(next) ? next : "/admin/dashboard";
}
