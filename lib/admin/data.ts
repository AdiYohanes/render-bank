import "server-only";

import { notFound } from "next/navigation";
import { requireAdmin } from "./auth";

export async function editorOptions() {
  const { client } = await requireAdmin();
  const [categories, models, tags, useCases, packs] = await Promise.all([
    client.from("categories").select("*").order("sort_order").order("name"), client.from("models").select("*").order("sort_order").order("name"),
    client.from("tags").select("*").order("name"), client.from("use_cases").select("*").order("name"), client.from("packs").select("*").order("title"),
  ]);
  for (const result of [categories, models, tags, useCases, packs]) if (result.error) throw new Error("Admin editor data is unavailable");
  return { categories: categories.data!, models: models.data!, tags: tags.data!, useCases: useCases.data!, packs: packs.data! };
}

export async function promptEditor(id: string) {
  const { client } = await requireAdmin();
  const { data, error } = await client.from("prompts").select("*,prompt_contents(*),prompt_variables(*),prompt_models(model_id),prompt_tags(tag_id),prompt_use_cases(use_case_id),prompt_images(media_asset_id,alt_text)").eq("id", id).maybeSingle();
  if (error) throw new Error("Prompt could not be loaded"); if (!data) notFound(); return data;
}

export async function packEditor(id: string) {
  const { client } = await requireAdmin();
  const { data, error } = await client.from("packs").select("*,pack_prompts(prompt_id,sort_order)").eq("id", id).maybeSingle();
  if (error) throw new Error("Pack could not be loaded"); if (!data) notFound(); return data;
}
