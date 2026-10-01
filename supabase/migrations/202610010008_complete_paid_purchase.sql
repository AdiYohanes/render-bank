create function public.complete_paid_purchase(
  p_provider text, p_provider_event_id text, p_provider_attempt_id text,
  p_event_type text, p_verified_status text, p_expected_pack_id uuid,
  p_amount_minor bigint, p_currency text, p_token_hash bytea
) returns table (purchase_id uuid, newly_completed boolean)
language plpgsql security invoker set search_path = '' as $$
declare
  attempt public.payment_attempts%rowtype;
  purchase public.purchases%rowtype;
  event public.payment_events%rowtype;
begin
  if p_provider is null or p_provider !~ '^[a-z][a-z0-9_-]{1,63}$'
    or p_provider_event_id is null or pg_catalog.length(pg_catalog.btrim(p_provider_event_id)) = 0
    or p_provider_attempt_id is null or pg_catalog.length(pg_catalog.btrim(p_provider_attempt_id)) = 0
    or p_event_type is null or pg_catalog.length(pg_catalog.btrim(p_event_type)) = 0
    or p_verified_status is distinct from 'SUCCEEDED' or p_expected_pack_id is null
    or p_amount_minor is null or p_amount_minor < 0 or p_currency is null or p_currency !~ '^[A-Z]{3}$'
    or p_token_hash is null or pg_catalog.octet_length(p_token_hash) <> 32 then
    raise exception 'Invalid verified payment facts';
  end if;

  select * into attempt from public.payment_attempts
    where provider = p_provider and provider_attempt_id = p_provider_attempt_id for update;
  if not found then raise exception 'Payment attempt not found'; end if;
  select * into purchase from public.purchases where id = attempt.purchase_id for update;
  if not found then raise exception 'Purchase not found'; end if;
  perform 1 from public.packs where id = purchase.pack_id for update;
  if not found then raise exception 'Prompt Pack not found'; end if;

  if purchase.pack_id is distinct from p_expected_pack_id
    or purchase.amount_minor is distinct from p_amount_minor or attempt.amount_minor is distinct from p_amount_minor
    or purchase.currency is distinct from p_currency or attempt.currency is distinct from p_currency then
    raise exception 'Verified payment does not match purchase';
  end if;

  select * into event from public.payment_events
    where provider = p_provider and provider_event_id = p_provider_event_id for update;
  if found then
    if event.payment_attempt_id <> attempt.id or event.event_type <> p_event_type
      or event.processing_status <> 'PROCESSED' or event.processed_at is null
      or purchase.payment_status <> 'PAID' or attempt.status <> 'SUCCEEDED' then
      raise exception 'Conflicting payment event';
    end if;
    purchase_id := purchase.id;
    newly_completed := false;
    return next;
    return;
  end if;

  if purchase.payment_status <> 'PROCESSING' or attempt.status not in ('CREATED', 'PROCESSING') then
    raise exception 'Invalid payment transition';
  end if;

  insert into public.payment_events(provider, provider_event_id, payment_attempt_id, event_type)
    values (p_provider, p_provider_event_id, attempt.id, p_event_type);
  update public.payment_attempts set status = 'SUCCEEDED' where id = attempt.id;
  update public.purchases set payment_status = 'PAID', paid_at = now() where id = purchase.id;
  insert into public.purchase_entitlements(purchase_id, prompt_id)
    select purchase.id, prompt_id from public.pack_prompts where pack_id = purchase.pack_id;
  insert into public.access_tokens(purchase_id, token_hash) values (purchase.id, p_token_hash);
  update public.payment_events set processing_status = 'PROCESSED', processed_at = now()
    where provider = p_provider and provider_event_id = p_provider_event_id;
  purchase_id := purchase.id;
  newly_completed := true;
  return next;
end;
$$;
revoke all on function public.complete_paid_purchase(text, text, text, text, text, uuid, bigint, text, bytea) from public, anon, authenticated;
grant execute on function public.complete_paid_purchase(text, text, text, text, text, uuid, bigint, text, bytea) to service_role;
