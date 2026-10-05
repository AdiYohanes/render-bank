-- bind_provider_attempt: one-time, service-role-only binding of a provider's
-- order id to a stored payment attempt (Phase 4 #29; contract: ADR-0001 and
-- DATABASE_SCHEMA §26). Idempotent per (attempt, order_id); any other order id
-- or a terminal attempt raises. The guard_buyer_terms trigger keeps the
-- binding immutable afterward.
create function public.bind_provider_attempt(
  p_attempt_key text, p_provider text, p_order_id text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  attempt public.payment_attempts%rowtype;
begin
  if p_attempt_key is null or pg_catalog.length(p_attempt_key) < 16
    or p_provider is null or p_provider !~ '^[a-z][a-z0-9_-]{1,63}$'
    or p_order_id is null or p_order_id !~ '^[A-Za-z0-9.\-_]{5,50}$' then
    raise exception 'Invalid provider attempt binding';
  end if;

  select * into attempt from public.payment_attempts
    where idempotency_key = p_attempt_key and provider = p_provider for update;
  if not found then raise exception 'Payment attempt not found'; end if;

  if attempt.status in ('FAILED', 'CANCELLED', 'EXPIRED') then
    raise exception 'Payment attempt is terminal';
  end if;

  if attempt.provider_attempt_id is not null then
    if attempt.provider_attempt_id = p_order_id then
      return; -- idempotent rebind of the same order id
    end if;
    raise exception 'Payment attempt already bound to another provider order';
  end if;

  update public.payment_attempts
    set provider_attempt_id = p_order_id
    where id = attempt.id;
end;
$$;
revoke all on function public.bind_provider_attempt(text, text, text) from public, anon, authenticated;
grant execute on function public.bind_provider_attempt(text, text, text) to service_role;
