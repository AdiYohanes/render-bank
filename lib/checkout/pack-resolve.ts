/**
 * Server-side resolver for the checkout route pack (#28). Verifies the pack is
 * purchasable for payment to start; archived packs refuse to sell. Public
 * metadata only — the same safety contract as discovery: no locked content is
 * selected, and RLS on the publishable key gates what is returned.
 */
import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import type { Database } from "@/lib/supabase/database.types";
import { publicSupabaseEnv } from "@/lib/supabase/public-env";

export type CheckoutPackRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_minor: number;
  currency: string;
  cover: {
    storage_path: string;
    width: number;
    height: number;
    bucket: string;
  } | null;
};

function visitor() {
  const { url, key } = publicSupabaseEnv();

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function queryCheckoutPack(slug: string) {
  const { data, error } = await visitor()
    .from("packs")
    .select("id,slug,title,description,price_minor,currency,status,cover:media_assets(storage_path,width,height,bucket)")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  if (error) throw new Error("Public discovery is temporarily unavailable");
  return data;
}

export const resolveCheckoutPack = unstable_cache(
  queryCheckoutPack,
  ["checkout-pack-v1"],
  { revalidate: 60, tags: ["discovery"] },
);
