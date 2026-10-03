import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import type { Database } from "@/lib/supabase/database.types";
import { publicSupabaseEnv } from "@/lib/supabase/public-env";

export type DiscoveryFilters = {
  q: string;
  category: string;
  model: string;
  orientation: string;
  access: string;
  page: number;
};

const pageSize = 12;

function visitor() {
  const { url, key } = publicSupabaseEnv();
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function checked<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error || result.data === null) throw new Error("Public discovery is temporarily unavailable");
  return result.data;
}

async function queryPrompts(filters: DiscoveryFilters) {
  const client = visitor();
  const rows = checked(await client.rpc("search_public_prompts", {
    search_query: filters.q || undefined,
    category_slug: filters.category || undefined,
    model_slug: filters.model || undefined,
    orientation_filter: filters.orientation ? filters.orientation.toUpperCase() as Database["public"]["Enums"]["orientation"] : undefined,
    access_filter: filters.access ? (filters.access === "premium" ? "PACK_ONLY" : "FREE") : undefined,
    page_size: pageSize + 1,
    page_offset: (filters.page - 1) * pageSize,
  }));
  const visible = rows.slice(0, pageSize);
  if (!visible.length) return { prompts: [], hasMore: false };
  const details = checked(await client.from("prompts").select("id,category:categories(slug,name),models:prompt_models(models(name)),images:prompt_images(is_primary,alt_text,media_assets(storage_path,width,height,bucket))").in("id", visible.map(({ id }) => id)));
  const byId = new Map(details.map((detail) => [detail.id, detail]));
  return {
    prompts: visible.map((row) => ({ ...row, ...byId.get(row.id) })),
    hasMore: rows.length > pageSize,
  };
}

export const discoverPrompts = unstable_cache(queryPrompts, ["public-prompts-v1"], { revalidate: 60, tags: ["discovery"] });

async function queryCategories() {
  return checked(await visitor().from("categories").select("id,slug,name,description").order("sort_order").order("name"));
}
export const discoverCategories = unstable_cache(queryCategories, ["public-categories-v1"], { revalidate: 60, tags: ["discovery"] });

async function queryModels() {
  return checked(await visitor().from("models").select("slug,name").order("sort_order").order("name"));
}
export const discoverModels = unstable_cache(queryModels, ["public-models-v1"], { revalidate: 60, tags: ["discovery"] });

async function queryPacks() {
  return checked(await visitor().from("packs").select("slug,title,description,price_minor,currency,cover:media_assets(storage_path,width,height,bucket)").order("published_at", { ascending: false }).limit(3));
}
export const discoverPacks = unstable_cache(queryPacks, ["public-packs-v1"], { revalidate: 60, tags: ["discovery"] });

export async function findCategory(slug: string) {
  const categories = await discoverCategories();
  return categories.find((category) => category.slug === slug);
}

export async function findPrompt(slug: string) {
  const { data, error } = await visitor().from("prompts").select("slug,title,short_description,access_type").eq("slug", slug).maybeSingle();
  if (error) throw new Error("Public discovery is temporarily unavailable");
  return data;
}

export async function findPack(slug: string) {
  const { data, error } = await visitor().from("packs").select("slug,title,description").eq("slug", slug).maybeSingle();
  if (error) throw new Error("Public discovery is temporarily unavailable");
  return data;
}
