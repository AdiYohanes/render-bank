create index prompts_discovery_order on public.prompts (published_at desc, id desc) where status = 'PUBLISHED';

create function public.search_public_prompts(
  search_query text default null,
  category_slug text default null,
  model_slug text default null,
  orientation_filter public.orientation default null,
  access_filter public.prompt_access_type default null,
  page_size integer default 12,
  page_offset integer default 0
)
returns table (id uuid, slug text, title text, short_description text, access_type public.prompt_access_type,
  category_id uuid, orientation public.orientation, published_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select p.id, p.slug, p.title, p.short_description, p.access_type, p.category_id, p.orientation, p.published_at
  from public.prompts p
  join public.categories c on c.id = p.category_id
  where p.status = 'PUBLISHED' and c.status = 'ACTIVE'
    and (nullif(btrim(search_query), '') is null or
      strpos(lower(p.title), lower(btrim(search_query))) > 0 or
      strpos(lower(p.short_description), lower(btrim(search_query))) > 0 or
      strpos(lower(coalesce(p.description, '')), lower(btrim(search_query))) > 0 or
      strpos(lower(c.name), lower(btrim(search_query))) > 0 or
      exists (select 1 from public.prompt_tags pt join public.tags t on t.id = pt.tag_id
        where pt.prompt_id = p.id and strpos(lower(t.name), lower(btrim(search_query))) > 0) or
      exists (select 1 from public.prompt_use_cases pu join public.use_cases u on u.id = pu.use_case_id
        where pu.prompt_id = p.id and strpos(lower(u.name), lower(btrim(search_query))) > 0))
    and (category_slug is null or c.slug = category_slug)
    and (model_slug is null or exists (
      select 1 from public.prompt_models pm join public.models m on m.id = pm.model_id
      where pm.prompt_id = p.id and m.slug = model_slug and m.status = 'ACTIVE'))
    and (orientation_filter is null or p.orientation = orientation_filter)
    and (access_filter is null or p.access_type = access_filter)
  order by p.published_at desc, p.id desc
  limit greatest(1, least(coalesce(page_size, 12), 1000))
  offset greatest(0, least(coalesce(page_offset, 0), 2400));
$$;
revoke all on function public.search_public_prompts(text, text, text, public.orientation, public.prompt_access_type, integer, integer) from public;
grant execute on function public.search_public_prompts(text, text, text, public.orientation, public.prompt_access_type, integer, integer) to anon, authenticated;
