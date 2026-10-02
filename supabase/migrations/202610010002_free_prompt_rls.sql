-- Public roles receive only the explicitly filtered Free Prompt SELECT policies below.
revoke all on public.categories, public.models, public.tags, public.use_cases,
  public.media_assets, public.prompts, public.prompt_contents, public.prompt_variables,
  public.prompt_images, public.prompt_models, public.prompt_tags, public.prompt_use_cases
  from public, anon, authenticated;

alter table public.categories enable row level security;
alter table public.models enable row level security;
alter table public.tags enable row level security;
alter table public.use_cases enable row level security;
alter table public.media_assets enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_contents enable row level security;
alter table public.prompt_variables enable row level security;
alter table public.prompt_images enable row level security;
alter table public.prompt_models enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.prompt_use_cases enable row level security;

grant select on public.categories, public.models, public.tags, public.use_cases,
  public.media_assets, public.prompts, public.prompt_contents, public.prompt_variables,
  public.prompt_images, public.prompt_models, public.prompt_tags, public.prompt_use_cases
  to anon, authenticated;

create policy "published Free Prompt metadata" on public.prompts for select to anon, authenticated
  using (status = 'PUBLISHED' and access_type = 'FREE');
create policy "published Free Prompt content" on public.prompt_contents for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_contents.prompt_id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "published Free Prompt variables" on public.prompt_variables for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_variables.prompt_id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "published Free Prompt images" on public.prompt_images for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_images.prompt_id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "published Free Prompt models" on public.prompt_models for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_models.prompt_id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "published Free Prompt tags" on public.prompt_tags for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_tags.prompt_id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "published Free Prompt use cases" on public.prompt_use_cases for select to anon, authenticated
  using (exists (select 1 from public.prompts p where p.id = prompt_use_cases.prompt_id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "active categories with published Free Prompts" on public.categories for select to anon, authenticated
  using (status = 'ACTIVE' and exists (select 1 from public.prompts p where p.category_id = categories.id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "active models on published Free Prompts" on public.models for select to anon, authenticated
  using (status = 'ACTIVE' and exists (select 1 from public.prompt_models pm join public.prompts p on p.id = pm.prompt_id where pm.model_id = models.id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "tags on published Free Prompts" on public.tags for select to anon, authenticated
  using (exists (select 1 from public.prompt_tags pt join public.prompts p on p.id = pt.prompt_id where pt.tag_id = tags.id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "active use cases on published Free Prompts" on public.use_cases for select to anon, authenticated
  using (status = 'ACTIVE' and exists (select 1 from public.prompt_use_cases pu join public.prompts p on p.id = pu.prompt_id where pu.use_case_id = use_cases.id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));
create policy "preview metadata on published Free Prompts" on public.media_assets for select to anon, authenticated
  using (bucket = 'prompt-previews' and exists (select 1 from public.prompt_images pi join public.prompts p on p.id = pi.prompt_id where pi.media_asset_id = media_assets.id and p.status = 'PUBLISHED' and p.access_type = 'FREE'));

insert into storage.buckets (id, name, public) values ('prompt-previews', 'prompt-previews', true);
-- No object INSERT/UPDATE/DELETE policies for browser roles; trusted upload begins in #5.
