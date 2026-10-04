"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, safeAdminNext } from "./auth";
import { uploadPreviewArtwork } from "@/lib/artwork/upload";
import { createTrustedSupabaseClient } from "@/lib/supabase/service";
import { createRequestSupabaseClient } from "@/lib/supabase/server";
import { parseCategory, parsePack, parsePrompt } from "./validation";

function fail(path: string, errors: string[]): never { redirect(`${path}?error=${encodeURIComponent(errors.join(" "))}`); }
function refresh(...paths: string[]) { for (const path of paths) revalidatePath(path); revalidateTag("discovery", "max"); }

export async function login(data: FormData) {
  const client = await createRequestSupabaseClient();
  const email = String(data.get("email") ?? "").trim();
  const password = String(data.get("password") ?? "");
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=Invalid%20credentials");
  const { data: { user } } = await client.auth.getUser();
  const { data: profile } = user ? await client.from("admin_profiles").select("is_active").eq("user_id", user.id).maybeSingle() : { data: null };
  if (!profile?.is_active) { await client.auth.signOut(); redirect("/admin/login?error=Invalid%20credentials"); }
  redirect(safeAdminNext(data.get("next")));
}

export async function logout() { const { client } = await requireAdmin(); await client.auth.signOut(); redirect("/admin/login"); }

async function removeUnusedArtwork(assetId: string) {
  const trusted = createTrustedSupabaseClient();
  const { data: asset, error } = await trusted.from("media_assets").select("bucket,storage_path").eq("id", assetId).single();
  if (error) throw new Error("Artwork cleanup failed", { cause: error });
  const object = await trusted.storage.from(asset.bucket).remove([asset.storage_path]);
  if (object.error) throw new Error("Artwork cleanup failed", { cause: object.error });
  const removed = await trusted.from("media_assets").delete().eq("id", assetId);
  if (removed.error) throw new Error("Artwork cleanup failed", { cause: removed.error });
}

async function uploadIfSelected(data: FormData) {
  const file = data.get("artwork");
  if (!file || (file instanceof File && !file.size)) return null;
  if (!(file instanceof File)) throw new Error("Invalid artwork input");
  return uploadPreviewArtwork(file);
}

export async function savePrompt(data: FormData) {
  const { client } = await requireAdmin();
  const id = String(data.get("id") ?? "") || null;
  const path = id && /^[0-9a-f-]{36}$/i.test(id) ? `/admin/prompts/${id}/edit` : "/admin/prompts/new";
  const parsed = parsePrompt(data);
  if (!parsed.ok) fail(path, parsed.errors);
  if (id && path.endsWith("/new")) fail(path, ["Invalid record identifier."]);
  const value = parsed.value;
  let uploaded: Awaited<ReturnType<typeof uploadPreviewArtwork>> | null;
  try { uploaded = await uploadIfSelected(data); }
  catch { fail(path, ["Artwork could not be uploaded. Check its size and format."]); }
  const payload = { title: value.title, slug: value.slug, short_description: value.shortDescription, description: value.description,
    prompt_template: value.promptTemplate, generation_notes: value.generationNotes, access_type: value.accessType, category_id: value.categoryId,
    aspect_ratio: value.aspectRatio, orientation: value.orientation, requires_reference_image: value.requiresReferenceImage,
    primary_sales_pack_id: value.primarySalesPackId, status: value.status, asset_id: uploaded?.id ?? value.assetId, image_alt: value.imageAlt,
    model_ids: value.modelIds, tag_ids: value.tagIds, use_case_ids: value.useCaseIds, variables: value.variables };
  let saved;
  try {
    const result = await client.rpc("save_admin_prompt", { p_prompt_id: id as string, p_data: payload });
    if (result.error) throw result.error;
    saved = result.data;
  } catch (error) {
    if (uploaded) await removeUnusedArtwork(uploaded.id);
    fail(path, [(error as { code?: string }).code === "23505" ? "That slug or relationship already exists." : "Prompt could not be saved."]);
  }
  refresh("/", "/explore", "/admin/prompts", `/prompts/${value.slug}`, "/sitemap.xml");
  redirect(`/admin/prompts/${saved}/edit?saved=1`);
}

export async function savePack(data: FormData) {
  const { client } = await requireAdmin();
  const id = String(data.get("id") ?? "") || null;
  const path = id && /^[0-9a-f-]{36}$/i.test(id) ? `/admin/packs/${id}/edit` : "/admin/packs/new";
  const parsed = parsePack(data);
  if (!parsed.ok) fail(path, parsed.errors);
  if (id && path.endsWith("/new")) fail(path, ["Invalid record identifier."]);
  const value = parsed.value;
  let uploaded: Awaited<ReturnType<typeof uploadPreviewArtwork>> | null;
  try { uploaded = await uploadIfSelected(data); }
  catch { fail(path, ["Artwork could not be uploaded. Check its size and format."]); }
  let saved;
  try {
    const result = await client.rpc("save_admin_pack", { p_pack_id: id as string, p_data: { title: value.title, slug: value.slug,
      description: value.description, cover_asset_id: uploaded?.id ?? value.coverAssetId, price_minor: value.priceMinor, currency: value.currency,
      status: value.status, prompt_ids: value.promptIds } });
    if (result.error) throw result.error;
    saved = result.data;
  } catch (error) {
    if (uploaded) await removeUnusedArtwork(uploaded.id);
    fail(path, [(error as { code?: string }).code === "23505" ? "That slug already exists." : "Pack could not be saved."]);
  }
  refresh("/", "/explore", "/packs", "/admin/packs", `/packs/${value.slug}`, "/sitemap.xml");
  redirect(`/admin/packs/${saved}/edit?saved=1`);
}

export async function saveCategory(data: FormData) {
  const { client } = await requireAdmin();
  const parsed = parseCategory(data);
  if (!parsed.ok) fail("/admin/categories", parsed.errors);
  const value = parsed.value; const id = String(data.get("id") ?? "");
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) fail("/admin/categories", ["Invalid category identifier."]);
  const query = id ? client.from("categories").update({ name: value.name, slug: value.slug, description: value.description, status: value.status, sort_order: value.sortOrder }).eq("id", id)
    : client.from("categories").insert({ name: value.name, slug: value.slug, description: value.description, status: value.status, sort_order: value.sortOrder });
  const { error } = await query;
  if (error) fail("/admin/categories", [error.code === "23505" ? "That slug already exists." : "Category could not be saved."]);
  refresh("/", "/explore", "/admin/categories", `/category/${value.slug}`, "/sitemap.xml"); redirect("/admin/categories?saved=1");
}
