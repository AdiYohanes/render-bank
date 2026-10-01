create type public.pack_status as enum ('DRAFT', 'PUBLISHED', 'UNLISTED', 'ARCHIVED');

create table public.packs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) > 0),
  description text not null check (length(btrim(description)) > 0),
  cover_asset_id uuid references public.media_assets(id) on delete restrict,
  price_minor bigint not null check (price_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status public.pack_status not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger packs_updated_at before update on public.packs for each row execute function public.set_updated_at();

alter table public.prompts add constraint prompts_primary_sales_pack_id_fkey
  foreign key (primary_sales_pack_id) references public.packs(id) on delete restrict;
create table public.pack_prompts (
  pack_id uuid not null references public.packs(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (pack_id, prompt_id)
);
create index pack_prompts_order on public.pack_prompts(pack_id, sort_order, prompt_id);
create index pack_prompts_prompt on public.pack_prompts(prompt_id, pack_id);
create index prompts_primary_sales_pack on public.prompts(primary_sales_pack_id);
create index packs_public on public.packs(status, published_at desc);

create table public.prompt_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete restrict,
  old_slug text not null unique check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);
create table public.pack_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs(id) on delete restrict,
  old_slug text not null unique check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create function public.guard_slug_namespace() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  candidate text;
begin
  if tg_table_name in ('prompts', 'packs') then
    if tg_op = 'UPDATE' and new.slug = old.slug then return new; end if;
    candidate := new.slug;
  else
    if tg_op = 'UPDATE' then raise exception 'Slug history is immutable'; end if;
    candidate := new.old_slug;
  end if;

  if tg_table_name in ('prompts', 'prompt_slug_redirects') then
    perform pg_catalog.pg_advisory_xact_lock(64721);
    if tg_table_name = 'prompts' then
      if exists (select 1 from public.prompt_slug_redirects where old_slug = candidate) then
        raise exception 'Prompt slug is reserved';
      end if;
    elsif exists (select 1 from public.prompts where slug = candidate) then
      raise exception 'Prompt slug is canonical';
    end if;
  else
    perform pg_catalog.pg_advisory_xact_lock(64722);
    if tg_table_name = 'packs' then
      if exists (select 1 from public.pack_slug_redirects where old_slug = candidate) then
        raise exception 'Pack slug is reserved';
      end if;
    elsif exists (select 1 from public.packs where slug = candidate) then
      raise exception 'Pack slug is canonical';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_slug_namespace() from public, anon, authenticated;
create trigger prompts_slug_guard before insert or update of slug on public.prompts
  for each row execute function public.guard_slug_namespace();
create trigger packs_slug_guard before insert or update of slug on public.packs
  for each row execute function public.guard_slug_namespace();
create trigger prompt_redirect_slug_guard before insert or update on public.prompt_slug_redirects
  for each row execute function public.guard_slug_namespace();
create trigger pack_redirect_slug_guard before insert or update on public.pack_slug_redirects
  for each row execute function public.guard_slug_namespace();

create function public.remember_published_slug() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (old.published_at is not null or old.status <> 'DRAFT') and old.slug <> new.slug then
    if tg_table_name = 'prompts' then
      insert into public.prompt_slug_redirects (prompt_id, old_slug) values (new.id, old.slug);
    else
      insert into public.pack_slug_redirects (pack_id, old_slug) values (new.id, old.slug);
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.remember_published_slug() from public, anon, authenticated;
create trigger prompts_remember_slug after update of slug on public.prompts
  for each row execute function public.remember_published_slug();
create trigger packs_remember_slug after update of slug on public.packs
  for each row execute function public.remember_published_slug();

create function public.preserve_slug_history() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Slug history is immutable';
end;
$$;
revoke all on function public.preserve_slug_history() from public, anon, authenticated;
create trigger prompt_redirect_no_delete before delete on public.prompt_slug_redirects
  for each row execute function public.preserve_slug_history();
create trigger pack_redirect_no_delete before delete on public.pack_slug_redirects
  for each row execute function public.preserve_slug_history();

create function public.lock_membership_pack() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  pack uuid;
begin
  for pack in
    select distinct id from (values
      (case when tg_op <> 'INSERT' then old.pack_id end),
      (case when tg_op <> 'DELETE' then new.pack_id end)
    ) as affected(id) where id is not null order by id
  loop
    perform 1 from public.packs where id = pack for update;
  end loop;
  return coalesce(new, old);
end;
$$;
revoke all on function public.lock_membership_pack() from public, anon, authenticated;
create trigger pack_prompts_lock before insert or update or delete on public.pack_prompts
  for each row execute function public.lock_membership_pack();

-- ponytail: this serializes publication edits globally; use ordered per-entity locks if write volume grows.
create function public.serialize_publication() returns trigger
language plpgsql set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(64723);
  return coalesce(new, old);
end;
$$;
revoke all on function public.serialize_publication() from public, anon, authenticated;
create trigger prompts_serialize before insert or update or delete on public.prompts
  for each row execute function public.serialize_publication();
create trigger packs_serialize before insert or update or delete on public.packs
  for each row execute function public.serialize_publication();
create trigger pack_prompts_serialize before insert or update or delete on public.pack_prompts
  for each row execute function public.serialize_publication();
create trigger prompt_contents_serialize before insert or update or delete on public.prompt_contents
  for each row execute function public.serialize_publication();
create trigger prompt_images_serialize before insert or update or delete on public.prompt_images
  for each row execute function public.serialize_publication();
create trigger prompt_models_serialize before insert or update or delete on public.prompt_models
  for each row execute function public.serialize_publication();
create trigger categories_serialize before update or delete on public.categories
  for each row execute function public.serialize_publication();
create trigger models_serialize before update or delete on public.models
  for each row execute function public.serialize_publication();

-- ponytail: this scans published rows at commit; narrow to affected IDs if inventory grows.
create function public.check_publication() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (
    select 1 from public.prompts p
    where p.status = 'PUBLISHED' and (
      not exists (select 1 from public.prompt_contents pc where pc.prompt_id = p.id)
      or not exists (select 1 from public.categories c where c.id = p.category_id and c.status = 'ACTIVE')
      or not exists (select 1 from public.prompt_images pi where pi.prompt_id = p.id)
      or not exists (select 1 from public.prompt_models pm join public.models m on m.id = pm.model_id
        where pm.prompt_id = p.id and m.status = 'ACTIVE')
      or (p.access_type = 'PACK_ONLY' and (
        p.primary_sales_pack_id is null
        or not exists (select 1 from public.packs pack join public.pack_prompts pp on pp.pack_id = pack.id
          where pack.id = p.primary_sales_pack_id and pp.prompt_id = p.id and pack.status = 'PUBLISHED')
      ))
    )
  ) then raise exception 'Published Prompt is missing required content or membership'; end if;

  if exists (
    select 1 from public.packs pack
    where pack.status = 'PUBLISHED' and (
      pack.cover_asset_id is null
      or not exists (select 1 from public.pack_prompts pp where pp.pack_id = pack.id)
      or exists (select 1 from public.pack_prompts pp join public.prompts p on p.id = pp.prompt_id
        where pp.pack_id = pack.id and (p.status <> 'PUBLISHED' or p.access_type <> 'PACK_ONLY'))
    )
  ) then raise exception 'Published Pack is missing a cover or valid Premium members'; end if;
  return null;
end;
$$;
revoke all on function public.check_publication() from public, anon, authenticated;
create constraint trigger prompts_publication after insert or update or delete on public.prompts
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger packs_publication after insert or update or delete on public.packs
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger pack_prompts_publication after insert or update or delete on public.pack_prompts
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger prompt_contents_publication after insert or update or delete on public.prompt_contents
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger prompt_images_publication after insert or update or delete on public.prompt_images
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger prompt_models_publication after insert or update or delete on public.prompt_models
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger categories_publication after update or delete on public.categories
  deferrable initially deferred for each row execute function public.check_publication();
create constraint trigger models_publication after update or delete on public.models
  deferrable initially deferred for each row execute function public.check_publication();
