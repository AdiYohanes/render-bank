create type public.content_status as enum ('ACTIVE', 'ARCHIVED');
create type public.prompt_access_type as enum ('FREE', 'PACK_ONLY');
create type public.prompt_status as enum ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'UNLISTED', 'ARCHIVED');
create type public.orientation as enum ('PORTRAIT', 'LANDSCAPE', 'SQUARE');

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  description text,
  status public.content_status not null default 'ACTIVE',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.models (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  provider_name text,
  status public.content_status not null default 'ACTIVE',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);
create table public.use_cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  status public.content_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket = 'prompt-previews'),
  storage_path text not null unique check (length(btrim(storage_path)) > 0),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  byte_size bigint not null check (byte_size > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  blur_placeholder text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) > 0),
  short_description text not null check (length(btrim(short_description)) > 0),
  description text,
  access_type public.prompt_access_type not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  aspect_ratio text check (aspect_ratio ~ '^[1-9][0-9]*:[1-9][0-9]*$'),
  orientation public.orientation,
  requires_reference_image boolean not null default false,
  primary_sales_pack_id uuid,
  status public.prompt_status not null default 'DRAFT',
  last_tested_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.prompt_contents (
  prompt_id uuid primary key references public.prompts(id) on delete cascade,
  prompt_template text not null check (length(btrim(prompt_template)) > 0),
  generation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.prompt_variables (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  key text not null check (key ~ '^[a-z][a-z0-9_]*$'),
  label text not null check (length(btrim(label)) > 0),
  description text,
  placeholder text,
  default_value text,
  required boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prompt_id, key)
);
create table public.prompt_images (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  alt_text text not null,
  focal_x numeric check (focal_x between 0 and 1),
  focal_y numeric check (focal_y between 0 and 1),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (prompt_id, media_asset_id)
);
create unique index prompt_images_one_primary on public.prompt_images(prompt_id) where is_primary;
create table public.prompt_models (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  model_id uuid not null references public.models(id) on delete restrict,
  relation_type text not null default 'RECOMMENDED' check (relation_type in ('RECOMMENDED', 'TESTED')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (prompt_id, model_id, relation_type)
);
create table public.prompt_tags (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (prompt_id, tag_id)
);
create table public.prompt_use_cases (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  use_case_id uuid not null references public.use_cases(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (prompt_id, use_case_id)
);

create index prompts_public on public.prompts(status, access_type, published_at desc);
create index prompt_variables_order on public.prompt_variables(prompt_id, sort_order, id);
create index prompt_images_order on public.prompt_images(prompt_id, sort_order, id);

create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger models_updated_at before update on public.models for each row execute function public.set_updated_at();
create trigger use_cases_updated_at before update on public.use_cases for each row execute function public.set_updated_at();
create trigger prompts_updated_at before update on public.prompts for each row execute function public.set_updated_at();
create trigger prompt_contents_updated_at before update on public.prompt_contents for each row execute function public.set_updated_at();
create trigger prompt_variables_updated_at before update on public.prompt_variables for each row execute function public.set_updated_at();
