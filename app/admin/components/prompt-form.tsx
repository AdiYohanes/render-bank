import type { Database } from "@/lib/supabase/database.types";
import Link from "next/link";

import { savePrompt } from "@/lib/admin/actions";
import { VariableRows } from "./variable-rows";

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
type Prompt = Row<"prompts"> & { prompt_contents: Row<"prompt_contents"> | null; prompt_variables: Row<"prompt_variables">[]; prompt_models: { model_id: string }[]; prompt_tags: { tag_id: string }[]; prompt_use_cases: { use_case_id: string }[]; prompt_images: { media_asset_id: string; alt_text: string }[] };
type Options = { categories: Row<"categories">[]; models: Row<"models">[]; tags: Row<"tags">[]; useCases: Row<"use_cases">[]; packs: Row<"packs">[] };

const selected = (rows: { [key: string]: string }[] | undefined, key: string) => rows?.map((row) => row[key]).join(",") ?? "";
export function PromptForm({ prompt, options, error, saved }: { prompt?: Prompt; options: Options; error?: string; saved?: string }) {
  const image = prompt?.prompt_images[0]; const assetId = image?.media_asset_id || "";
  const variables = [...(prompt?.prompt_variables ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    .map(({ key, label, description, placeholder, default_value, required }) => ({ key, label, description, placeholder, default_value, required }));
  return <><header className="admin-heading"><div><p className="eyebrow">Prompts</p><h1>{prompt ? "Edit prompt" : "New prompt"}</h1></div><Link className="button-secondary" href="/admin/prompts">Back to list</Link></header>
    {saved && <p className="success" role="status">Prompt saved.</p>}{error && <p className="form-error" role="alert">{error}</p>}
    {prompt?.published_at && <p className="notice">Changing this published slug creates a permanent redirect. Unpublishing preserves existing buyer entitlement.</p>}
    <form action={savePrompt} className="admin-form-grid"><section className="admin-panel form-stack">
      <input name="id" type="hidden" value={prompt?.id ?? ""} /><input name="assetId" type="hidden" value={assetId} />
      <label>Title<input required defaultValue={prompt?.title} name="title" /></label><label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={prompt?.slug} name="slug" /></label>
      <label>Short description<textarea required defaultValue={prompt?.short_description} name="shortDescription" rows={2} /></label><label>Description<textarea defaultValue={prompt?.description ?? ""} name="description" rows={4} /></label>
      <label>Prompt template<textarea required defaultValue={prompt?.prompt_contents?.prompt_template} name="promptTemplate" rows={14} /></label>
      <label>Generation notes<textarea defaultValue={prompt?.prompt_contents?.generation_notes ?? ""} name="generationNotes" rows={4} /></label>
      <VariableRows initial={variables} />
      <label>Preview alt text<input defaultValue={image?.alt_text ?? ""} name="imageAlt" /></label>
      <label>Preview artwork<input accept="image/jpeg,image/png,image/webp,image/avif" name="artwork" type="file" /><span className="field-help">Optional replacement. JPEG, PNG, WebP, or AVIF; validated and converted to WebP on save.</span></label>
    </section><aside className="admin-panel form-stack">
      <label>Status<select defaultValue={prompt?.status ?? "DRAFT"} name="status">{["DRAFT","PUBLISHED","UNPUBLISHED","UNLISTED","ARCHIVED"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Access<select defaultValue={prompt?.access_type ?? "FREE"} name="accessType"><option value="FREE">Free</option><option value="PACK_ONLY">Premium</option></select></label>
      <label>Category<select required defaultValue={prompt?.category_id} name="categoryId"><option value="">Choose…</option>{options.categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Model<select multiple defaultValue={selected(prompt?.prompt_models,"model_id").split(",").filter(Boolean)} name="modelIds">{options.models.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Tags<select multiple defaultValue={selected(prompt?.prompt_tags,"tag_id").split(",").filter(Boolean)} name="tagIds">{options.tags.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Use cases<select multiple defaultValue={selected(prompt?.prompt_use_cases,"use_case_id").split(",").filter(Boolean)} name="useCaseIds">{options.useCases.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Primary sales pack<select defaultValue={prompt?.primary_sales_pack_id ?? ""} name="primarySalesPackId"><option value="">None</option>{options.packs.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
      <label>Aspect ratio<input defaultValue={prompt?.aspect_ratio ?? ""} name="aspectRatio" placeholder="1:1" /></label><label>Orientation<select defaultValue={prompt?.orientation ?? ""} name="orientation"><option value="">Unset</option>{["PORTRAIT","LANDSCAPE","SQUARE"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="check"><input defaultChecked={prompt?.requires_reference_image} name="requiresReferenceImage" type="checkbox" /> Requires reference image</label>
      <button className="button-primary" type="submit">Save prompt</button>
    </aside></form></>;
}
