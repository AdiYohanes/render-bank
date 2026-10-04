// @ts-check
/**
 * Server-side resolver for the checkout route pack (#28). Verifies the pack is
 * purchasable for payment to start; archived packs refuse to sell.
 */
import "server-only";

import { createTrustedSupabaseClient } from "@/lib/supabase/service";

/**
 * @param {string} slug
 */
export async function resolveCheckoutPack(slug) {
  const trusted = createTrustedSupabaseClient();
  const { data } = await trusted
    .from("packs")
    .select("id,slug,title,description,price_minor,currency,status,cover:media_assets(storage_path,width,height,bucket)")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  return data ?? null;
}
