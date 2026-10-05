-- record_unpaid_payment_event: companion of complete_paid_purchase and the
-- only writer of paid-purchase-complement attempt/purchase transitions
-- (Phase 4 #30; contract: ADR-0001 lifecycle table and DATABASE_SCHEMA §39).
-- Idempotent by (provider, provider_event_id); a decided attempt is only
-- recorded, never regressed; can never create an entitlement, token, or PAID
-- state. Stores the verified-fact digest only — never a raw provider payload.
create function public.record_unpaid_payment_event(
  p_provider text, p_provider_event_id text, p_provider_attempt_id text,
  p_event_type text, p_event_outcome text, p_provider_payload_digest text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  attempt public.payment_attempts%rowtype;
  purchase public.purchases%rowtype;
begin
  if p_provider is null or p_provider !~ '^[a-z][a-z0-9_-]{1,63}$'
    or p_provider_event_id is null or pg_catalog.length(pg_catalog.btrim(p_provider_event_id)) = 0
    or p_provider_attempt_id is null or pg_catalog.length(pg_catalog.btrim(p_provider_attempt_id)) = 0
    or p_event_type is null or p_event_type !~ '^[a-z_.]{1,64}$'
    or p_event_outcome is null or p_event_outcome not in ('FAILED', 'CANCELLED', 'EXPIRED', 'IGNORED')
    or p_provider_payload_digest is null or p_provider_payload_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid verified payment facts';
  end if;

  select * into attempt from public.payment_attempts
    where provider = p_provider and provider_attempt_id = p_provider_attempt_id for update;
  if not found then raise exception 'Payment attempt not found'; end if;
  select * into purchase from public.purchases where id = attempt.purchase_id for update;
  if not found then raise exception 'Purchase not found'; end if;

  -- insert-or-resolve idempotently; the attempt row lock serializes concurrent
  -- deliveries of the same event, so any later same-event delivery finds the
  -- recorded row here and short-circuits without mutation.
  perform 1 from public.payment_events
    where provider = p_provider and provider_event_id = p_provider_event_id;
  if found then return; end if;

  -- Decided attempts and paid purchases are recorded as IGNORED, never
  -- regressed; IGNORED outcomes always write only the event row.
  if p_event_outcome = 'IGNORED'
    or attempt.status = 'SUCCEEDED' or purchase.payment_status = 'PAID'
    or attempt.status in ('FAILED', 'CANCELLED', 'EXPIRED') then
    insert into public.payment_events(provider, provider_event_id, payment_attempt_id, event_type,
      processing_status, provider_payload_digest, safe_metadata)
      values (p_provider, p_provider_event_id, attempt.id, p_event_type, 'IGNORED',
        p_provider_payload_digest,
        jsonb_build_object('outcome', p_event_outcome));
    return;
  end if;

  -- Decided, live attempt: apply the outcome's one legal transition.
  -- (CREATED/PROCESSING here; PAID/SUCCEEDED and terminal states above.)
  insert into public.payment_events(provider, provider_event_id, payment_attempt_id, event_type,
    processing_status, provider_payload_digest, safe_metadata, processed_at)
    values (p_provider, p_provider_event_id, attempt.id, p_event_type, 'PROCESSED',
      p_provider_payload_digest,
      jsonb_build_object('outcome', p_event_outcome), now());

  update public.payment_attempts
    set status = case p_event_outcome
      when 'FAILED' then 'FAILED'::public.payment_attempt_status
      when 'CANCELLED' then 'CANCELLED'::public.payment_attempt_status
      else 'EXPIRED'::public.payment_attempt_status
    end
    where id = attempt.id;

  -- ADR-0001 lifecycle mapping: FAILED → purchase FAILED; CANCELLED/EXPIRED →
  -- purchase CANCELLED (a never-paid purchase's durable complement state).
  if purchase.payment_status = 'PROCESSING' then
    update public.purchases
      set payment_status = case p_event_outcome
        when 'FAILED' then 'FAILED'::public.payment_status
        else 'CANCELLED'::public.payment_status
      end
      where id = purchase.id;
  end if;
end;
$$;
revoke all on function public.record_unpaid_payment_event(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.record_unpaid_payment_event(text, text, text, text, text, text) to service_role;
