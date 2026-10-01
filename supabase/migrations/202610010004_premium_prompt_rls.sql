revoke all on public.packs, public.pack_prompts, public.prompt_slug_redirects, public.pack_slug_redirects
  from public, anon, authenticated;
alter table public.packs enable row level security;
alter table public.pack_prompts enable row level security;
alter table public.prompt_slug_redirects enable row level security;
alter table public.pack_slug_redirects enable row level security;
grant select on public.packs, public.pack_prompts, public.prompt_slug_redirects, public.pack_slug_redirects
  to anon, authenticated;

create policy "published Packs" on public.packs for select to anon, authenticated
  using (status = 'PUBLISHED');
create policy "published Pack membership" on public.pack_prompts for select to anon, authenticated
  using (exists (select 1 from public.packs pack where pack.id = pack_id and pack.status = 'PUBLISHED')
    and exists (select 1 from public.prompts p where p.id = prompt_id and p.status = 'PUBLISHED' and p.access_type = 'PACK_ONLY'));
create policy "published Prompt redirects" on public.prompt_slug_redirects for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_id and p.status = 'PUBLISHED'));
create policy "published Pack redirects" on public.pack_slug_redirects for select to anon, authenticated
  using (exists (select 1 from public.packs pack where pack.id = pack_id and pack.status = 'PUBLISHED'));

-- Only safe Prompt metadata and its public preview relationships widen; recipes and variables remain Free-only.
drop policy "published Free Prompt metadata" on public.prompts;
create policy "published Prompt metadata" on public.prompts for select to anon, authenticated
  using (status = 'PUBLISHED');
drop policy "published Free Prompt images" on public.prompt_images;
create policy "published Prompt images" on public.prompt_images for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_images.prompt_id and p.status = 'PUBLISHED'));
drop policy "published Free Prompt models" on public.prompt_models;
create policy "published Prompt models" on public.prompt_models for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_models.prompt_id and p.status = 'PUBLISHED'));
drop policy "published Free Prompt tags" on public.prompt_tags;
create policy "published Prompt tags" on public.prompt_tags for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_tags.prompt_id and p.status = 'PUBLISHED'));
drop policy "published Free Prompt use cases" on public.prompt_use_cases;
create policy "published Prompt use cases" on public.prompt_use_cases for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_use_cases.prompt_id and p.status = 'PUBLISHED'));
drop policy "active categories with published Free Prompts" on public.categories;
create policy "active categories with published Prompts" on public.categories for select to anon, authenticated
  using (status = 'ACTIVE' and exists (select 1 from public.prompts p where p.category_id = categories.id and p.status = 'PUBLISHED'));
drop policy "active models on published Free Prompts" on public.models;
create policy "active models on published Prompts" on public.models for select to anon, authenticated
  using (status = 'ACTIVE' and exists (select 1 from public.prompt_models pm join public.prompts p on p.id = pm.prompt_id
    where pm.model_id = models.id and p.status = 'PUBLISHED'));
drop policy "tags on published Free Prompts" on public.tags;
create policy "tags on published Prompts" on public.tags for select to anon, authenticated
  using (exists (select 1 from public.prompt_tags pt join public.prompts p on p.id = pt.prompt_id
    where pt.tag_id = tags.id and p.status = 'PUBLISHED'));
drop policy "active use cases on published Free Prompts" on public.use_cases;
create policy "active use cases on published Prompts" on public.use_cases for select to anon, authenticated
  using (status = 'ACTIVE' and exists (select 1 from public.prompt_use_cases pu join public.prompts p on p.id = pu.prompt_id
    where pu.use_case_id = use_cases.id and p.status = 'PUBLISHED'));
drop policy "preview metadata on published Free Prompts" on public.media_assets;
create policy "published preview and cover metadata" on public.media_assets for select to anon, authenticated
  using (bucket = 'prompt-previews' and (
    exists (select 1 from public.prompt_images pi join public.prompts p on p.id = pi.prompt_id
      where pi.media_asset_id = media_assets.id and p.status = 'PUBLISHED')
    or exists (select 1 from public.packs pack where pack.cover_asset_id = media_assets.id and pack.status = 'PUBLISHED')
  ));
