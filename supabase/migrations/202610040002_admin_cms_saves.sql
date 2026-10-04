-- Atomic editor saves keep the parent and all dependent rows consistent with deferred publication checks.
create function public.save_admin_prompt(p_prompt_id uuid, p_data jsonb) returns uuid
language plpgsql set search_path = '' as $$
declare
  saved_id uuid := coalesce(p_prompt_id, gen_random_uuid());
  item jsonb;
begin
  if not (select private.is_active_admin()) then raise exception 'Active Admin required'; end if;
  if nullif(p_data->>'asset_id','') is not null
    and not exists (select 1 from public.prompt_images where prompt_id = p_prompt_id and media_asset_id = (p_data->>'asset_id')::uuid)
    and not exists (
      select 1 from public.media_assets where id = (p_data->>'asset_id')::uuid and created_by = (select auth.uid())
    ) then raise exception 'Artwork must be uploaded by the active Admin'; end if;

  if p_prompt_id is null then
    insert into public.prompts (id, title, slug, short_description, description, access_type, category_id, aspect_ratio, orientation,
      requires_reference_image, primary_sales_pack_id, status, published_at)
    values (saved_id, p_data->>'title', p_data->>'slug', p_data->>'short_description', p_data->>'description',
      (p_data->>'access_type')::public.prompt_access_type, (p_data->>'category_id')::uuid, nullif(p_data->>'aspect_ratio',''),
      nullif(p_data->>'orientation','')::public.orientation, coalesce((p_data->>'requires_reference_image')::boolean, false),
      nullif(p_data->>'primary_sales_pack_id','')::uuid, (p_data->>'status')::public.prompt_status,
      case when p_data->>'status' = 'PUBLISHED' then now() end);
  else
    update public.prompts set title = p_data->>'title', slug = p_data->>'slug', short_description = p_data->>'short_description',
      description = p_data->>'description', access_type = (p_data->>'access_type')::public.prompt_access_type,
      category_id = (p_data->>'category_id')::uuid, aspect_ratio = nullif(p_data->>'aspect_ratio',''),
      orientation = nullif(p_data->>'orientation','')::public.orientation,
      requires_reference_image = coalesce((p_data->>'requires_reference_image')::boolean, false),
      primary_sales_pack_id = nullif(p_data->>'primary_sales_pack_id','')::uuid,
      status = (p_data->>'status')::public.prompt_status,
      published_at = case when p_data->>'status' = 'PUBLISHED' then coalesce(published_at, now()) else published_at end
    where id = saved_id;
    if not found then raise exception 'Prompt not found'; end if;
  end if;

  insert into public.prompt_contents (prompt_id, prompt_template, generation_notes)
  values (saved_id, p_data->>'prompt_template', p_data->>'generation_notes')
  on conflict (prompt_id) do update set prompt_template = excluded.prompt_template, generation_notes = excluded.generation_notes;

  delete from public.prompt_variables where prompt_id = saved_id;
  for item in select value from jsonb_array_elements(coalesce(p_data->'variables', '[]'::jsonb)) loop
    insert into public.prompt_variables (prompt_id, key, label, description, placeholder, default_value, required, sort_order)
    values (saved_id, item->>'key', item->>'label', item->>'description', item->>'placeholder', item->>'default_value',
      coalesce((item->>'required')::boolean, false), coalesce((item->>'sort_order')::integer, 0));
  end loop;

  delete from public.prompt_models where prompt_id = saved_id;
  insert into public.prompt_models (prompt_id, model_id, sort_order)
    select saved_id, value::uuid, ordinality - 1 from jsonb_array_elements_text(coalesce(p_data->'model_ids','[]'::jsonb)) with ordinality;
  delete from public.prompt_tags where prompt_id = saved_id;
  insert into public.prompt_tags (prompt_id, tag_id)
    select saved_id, value::uuid from jsonb_array_elements_text(coalesce(p_data->'tag_ids','[]'::jsonb));
  delete from public.prompt_use_cases where prompt_id = saved_id;
  insert into public.prompt_use_cases (prompt_id, use_case_id)
    select saved_id, value::uuid from jsonb_array_elements_text(coalesce(p_data->'use_case_ids','[]'::jsonb));

  if nullif(p_data->>'asset_id','') is not null then
    delete from public.prompt_images where prompt_id = saved_id;
    insert into public.prompt_images (prompt_id, media_asset_id, alt_text, is_primary)
      values (saved_id, (p_data->>'asset_id')::uuid, p_data->>'image_alt', true);
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_admin_prompt(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_admin_prompt(uuid, jsonb) to authenticated;

create function public.save_admin_pack(p_pack_id uuid, p_data jsonb) returns uuid
language plpgsql set search_path = '' as $$
declare saved_id uuid := coalesce(p_pack_id, gen_random_uuid());
begin
  if not (select private.is_active_admin()) then raise exception 'Active Admin required'; end if;
  if nullif(p_data->>'cover_asset_id','') is not null
    and not exists (select 1 from public.packs where id = p_pack_id and cover_asset_id = (p_data->>'cover_asset_id')::uuid)
    and not exists (
      select 1 from public.media_assets where id = (p_data->>'cover_asset_id')::uuid and created_by = (select auth.uid())
    ) then raise exception 'Cover must be uploaded by the active Admin'; end if;
  if p_pack_id is null then
    insert into public.packs (id,title,slug,description,cover_asset_id,price_minor,currency,status,published_at)
    values (saved_id,p_data->>'title',p_data->>'slug',p_data->>'description',nullif(p_data->>'cover_asset_id','')::uuid,
      (p_data->>'price_minor')::bigint,p_data->>'currency',(p_data->>'status')::public.pack_status,
      case when p_data->>'status'='PUBLISHED' then now() end);
  else
    update public.packs set title=p_data->>'title',slug=p_data->>'slug',description=p_data->>'description',
      cover_asset_id=nullif(p_data->>'cover_asset_id','')::uuid,price_minor=(p_data->>'price_minor')::bigint,
      currency=p_data->>'currency',status=(p_data->>'status')::public.pack_status,
      published_at=case when p_data->>'status'='PUBLISHED' then coalesce(published_at,now()) else published_at end
    where id=saved_id;
    if not found then raise exception 'Pack not found'; end if;
  end if;
  delete from public.pack_prompts where pack_id=saved_id;
  insert into public.pack_prompts(pack_id,prompt_id,sort_order)
    select saved_id,value::uuid,ordinality-1 from jsonb_array_elements_text(coalesce(p_data->'prompt_ids','[]'::jsonb)) with ordinality;
  -- First publication is one transaction: selected eligible Premium drafts become members of this published pack.
  if p_data->>'status' = 'PUBLISHED' then
    update public.prompts p set status = 'PUBLISHED', published_at = coalesce(p.published_at, now()),
      primary_sales_pack_id = coalesce(p.primary_sales_pack_id, saved_id)
    where p.id in (select pp.prompt_id from public.pack_prompts pp where pp.pack_id = saved_id)
      and p.access_type = 'PACK_ONLY' and p.status in ('DRAFT', 'UNPUBLISHED', 'UNLISTED')
      and (p.primary_sales_pack_id is null or p.primary_sales_pack_id = saved_id);
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_admin_pack(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_admin_pack(uuid, jsonb) to authenticated;
