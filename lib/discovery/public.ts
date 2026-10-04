import "server-only";

import type { Database } from "@/lib/supabase/database.types";
import type { DiscoveryFilters } from "./shared-types";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { discoveryWindow } from "./url";

import { publicSupabaseEnv } from "@/lib/supabase/public-env";

export { artworkUrl } from "./shared.mjs";
export type { DiscoveryFilters, DiscoveryPrompt } from "./shared-types";

function visitor() {
  const { url, key } = publicSupabaseEnv();

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function checked<T>(result: {
  data: T | null;
  error: { message: string } | null;
}): T {
  if (result.error || result.data === null)
    throw new Error("Public discovery is temporarily unavailable");

  return result.data;
}

const promptDetail =
  "id,category:categories(slug,name),models:prompt_models(models(name)),images:prompt_images(is_primary,alt_text,media_assets(storage_path,width,height,bucket))";

async function fetchPromptDetails(ids: string[]) {
  const rows = checked(
    await visitor().from("prompts").select(promptDetail).in("id", ids),
  );

  return new Map(rows.map((row) => [row.id, row]));
}

async function queryFeaturedPrompts() {
  const rows = checked(
    await visitor()
      .from("prompts")
      .select(
        `id,slug,title,short_description,access_type,category_id,orientation,published_at,featured_order`,
      )
      .not("featured_order", "is", null)
      .eq("status", "PUBLISHED")
      .order("featured_order")
      .order("id")
      .limit(4),
  );
  const details = await fetchPromptDetails(rows.map(({ id }) => id));

  return rows.map((row) => ({ ...row, ...details.get(row.id) }));
}
export const discoverFeaturedPrompts = unstable_cache(
  queryFeaturedPrompts,
  ["public-featured-v1"],
  { revalidate: 60, tags: ["discovery"] },
);

async function queryPrompts(filters: DiscoveryFilters) {
  const client = visitor();
  const { size, offset } = discoveryWindow(filters.page);
  const rows = checked(
    await client.rpc("search_public_prompts", {
      // Domain-typed arg accepts a bound string; generated type widens to unknown.
      search_query: filters.q || undefined,
      category_slug: filters.category || undefined,
      model_slug: filters.model || undefined,
      orientation_filter: filters.orientation
        ? (filters.orientation.toUpperCase() as Database["public"]["Enums"]["orientation"])
        : undefined,
      access_filter: filters.access
        ? filters.access === "premium"
          ? "PACK_ONLY"
          : "FREE"
        : undefined,
      page_size: size,
      page_offset: offset,
    }),
  );
  const visible = rows.slice(0, size - 1);

  if (!visible.length) return { prompts: [], hasMore: false };
  const details = await fetchPromptDetails(visible.map(({ id }) => id));

  return {
    prompts: visible.map((row) => ({
      ...row,
      featured_order: null,
      ...details.get(row.id),
    })),
    hasMore: rows.length >= size && filters.page < 83,
  };
}

export const discoverPrompts = unstable_cache(
  queryPrompts,
  ["public-prompts-v1"],
  { revalidate: 60, tags: ["discovery"] },
);

async function queryCategories() {
  return checked(
    await visitor()
      .from("categories")
      .select("id,slug,name,description")
      .order("sort_order")
      .order("name"),
  );
}
export const discoverCategories = unstable_cache(
  queryCategories,
  ["public-categories-v1"],
  { revalidate: 60, tags: ["discovery"] },
);

async function queryModels() {
  return checked(
    await visitor()
      .from("models")
      .select("slug,name")
      .order("sort_order")
      .order("name"),
  );
}
export const discoverModels = unstable_cache(
  queryModels,
  ["public-models-v1"],
  { revalidate: 60, tags: ["discovery"] },
);

async function queryPacks() {
  return checked(
    await visitor()
      .from("packs")
      .select(
        "slug,title,description,price_minor,currency,cover:media_assets(storage_path,width,height,bucket),prompt_count:pack_prompts(count)",
      )
      .order("published_at", { ascending: false })
      .limit(3),
  ) as Array<{
    slug: string;
    title: string;
    description: string;
    price_minor: number;
    currency: string;
    cover: {
      storage_path: string;
      width: number;
      height: number;
      bucket: string;
    } | null;
    prompt_count: { count: number }[];
  }>;
}
export const discoverPacks = unstable_cache(queryPacks, ["public-packs-v1"], {
  revalidate: 60,
  tags: ["discovery"],
});

export async function findCategory(slug: string) {
  const categories = await discoverCategories();

  return categories.find((category) => category.slug === slug);
}

export async function findPrompt(slug: string) {
  const { data, error } = await visitor()
    .from("prompts")
    .select("slug,title,short_description,access_type")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error("Public discovery is temporarily unavailable");

  return data;
}

export async function findPack(slug: string) {
  const { data, error } = await visitor()
    .from("packs")
    .select("slug,title,description")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error("Public discovery is temporarily unavailable");

  return data;
}
