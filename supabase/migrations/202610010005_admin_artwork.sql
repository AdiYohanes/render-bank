create type public.admin_role as enum ('ADMIN');

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  role public.admin_role not null default 'ADMIN',
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger admin_profiles_updated_at before update on public.admin_profiles
  for each row execute function public.set_updated_at();
revoke all on public.admin_profiles from public, anon, authenticated;
alter table public.admin_profiles enable row level security;
grant select on public.admin_profiles to authenticated;
create policy "own Admin profile" on public.admin_profiles for select to authenticated
  using (user_id = (select auth.uid()));

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
create function private.is_active_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = (select auth.uid()) and is_active
  );
$$;
revoke all on function private.is_active_admin() from public, anon, authenticated;
grant execute on function private.is_active_admin() to authenticated;

-- Admin-authenticated browser roles may edit editorial data, never provisioning or validated asset rows.
grant select, insert, update, delete on public.categories, public.models, public.tags, public.use_cases,
  public.prompts, public.prompt_contents, public.prompt_variables, public.prompt_images,
  public.prompt_models, public.prompt_tags, public.prompt_use_cases, public.packs, public.pack_prompts
  to authenticated;
create policy "active Admin categories" on public.categories for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin models" on public.models for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin tags" on public.tags for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin use cases" on public.use_cases for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin prompts" on public.prompts for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Prompt contents" on public.prompt_contents for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Prompt variables" on public.prompt_variables for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Prompt images" on public.prompt_images for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Prompt models" on public.prompt_models for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Prompt tags" on public.prompt_tags for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Prompt use cases" on public.prompt_use_cases for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Packs" on public.packs for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin Pack membership" on public.pack_prompts for all to authenticated
  using ((select private.is_active_admin())) with check ((select private.is_active_admin()));
create policy "active Admin preview metadata" on public.media_assets for select to authenticated
  using ((select private.is_active_admin()));
create policy "active Admin Prompt redirects" on public.prompt_slug_redirects for select to authenticated
  using ((select private.is_active_admin()));
create policy "active Admin Pack redirects" on public.pack_slug_redirects for select to authenticated
  using ((select private.is_active_admin()));

-- Public bucket bytes are immediately readable: enforce media restrictions as a second line of defense.
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  where id = 'prompt-previews';
