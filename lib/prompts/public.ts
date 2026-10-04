import "server-only";

import type { Database } from "@/lib/supabase/database.types";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { publicSupabaseEnv } from "@/lib/supabase/public-env";

type Variable = Pick<Database["public"]["Tables"]["prompt_variables"]["Row"], "id" | "key" | "label" | "description" | "placeholder" | "default_value" | "required">;

function visitor() {
  const { url, key } = publicSupabaseEnv();
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function queryPrompt(slug: string) {
  const client = visitor();
  const { data: prompt, error } = await client.from("prompts")
    .select("id,slug,title,short_description,description,access_type,aspect_ratio,orientation,requires_reference_image,category:categories(slug,name),models:prompt_models(models(name)),images:prompt_images(is_primary,alt_text,media_assets(storage_path,width,height,bucket)),pack:packs!prompts_primary_sales_pack_id_fkey(slug,title)")
    .eq("slug", slug).eq("status", "PUBLISHED").maybeSingle();
  if (error) throw new Error("Prompt detail is temporarily unavailable");
  if (!prompt) return null;

  // A locked result is constructed before querying either protected table.
  if (prompt.access_type !== "FREE") return { ...prompt, state: "locked" as const };

  const [contentResult, variableResult] = await Promise.all([
    client.from("prompt_contents").select("prompt_template,generation_notes").eq("prompt_id", prompt.id).single(),
    client.from("prompt_variables").select("id,key,label,description,placeholder,default_value,required").eq("prompt_id", prompt.id).order("sort_order").order("id"),
  ]);
  if (contentResult.error || variableResult.error || !contentResult.data || !variableResult.data)
    throw new Error("Prompt detail is temporarily unavailable");
  return { ...prompt, state: "free" as const, content: contentResult.data, variables: variableResult.data as Variable[] };
}

export const findPromptDetail = unstable_cache(queryPrompt, ["public-prompt-detail-v1"], {
  revalidate: 60, tags: ["discovery"],
});

export async function discoverPromptSlugs() {
  const { data, error } = await visitor().from("prompts").select("slug").eq("status", "PUBLISHED");
  if (error) throw new Error("Prompt sitemap is temporarily unavailable");
  return data;
}

