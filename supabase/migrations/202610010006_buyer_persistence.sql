create extension if not exists citext with schema extensions;
create type public.payment_status as enum ('PROCESSING', 'PAID', 'FAILED', 'CANCELLED');
create type public.payment_attempt_status as enum ('CREATED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED');
create type public.payment_event_status as enum ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');
create type public.entitlement_status as enum ('ACTIVE', 'SUSPENDED');
create type public.entitlement_source as enum ('PACK_SNAPSHOT', 'FREE_UPDATE');
create type public.access_token_status as enum ('ACTIVE', 'ROTATED', 'REVOKED');
create type public.email_delivery_status as enum ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');
create type public.email_purpose as enum ('ACCESS_LINK');

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique check (length(public_reference) >= 32),
  buyer_email_normalized extensions.citext not null check (buyer_email_normalized::text = lower(btrim(buyer_email_normalized::text)) and buyer_email_normalized::text ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  pack_id uuid not null references public.packs(id) on delete restrict,
  pack_title_snapshot text not null check (length(btrim(pack_title_snapshot)) > 0),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  payment_status public.payment_status not null default 'PROCESSING',
  entitlement_status public.entitlement_status not null default 'ACTIVE',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchases_paid_at_check check ((payment_status = 'PAID') = (paid_at is not null))
);
create index purchases_email on public.purchases(buyer_email_normalized);
create index purchases_payment on public.purchases(payment_status, created_at);
create index purchases_pack on public.purchases(pack_id, created_at);
create trigger purchases_updated_at before update on public.purchases for each row execute function public.set_updated_at();

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  provider text not null check (provider ~ '^[a-z][a-z0-9_-]{1,63}$'),
  provider_attempt_id text,
  idempotency_key text not null unique check (length(idempotency_key) >= 16),
  checkout_claim_hash bytea not null unique check (octet_length(checkout_claim_hash) = 32),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status public.payment_attempt_status not null default 'CREATED',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, provider)
);
create unique index payment_attempts_provider_attempt_uidx on public.payment_attempts(provider, provider_attempt_id) where provider_attempt_id is not null;
create index payment_attempts_purchase on public.payment_attempts(purchase_id, created_at);
create trigger payment_attempts_updated_at before update on public.payment_attempts for each row execute function public.set_updated_at();

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payment_attempt_id uuid not null,
  event_type text not null,
  processing_status public.payment_event_status not null default 'RECEIVED',
  provider_payload_digest text,
  safe_metadata jsonb not null default '{}'::jsonb,
  safe_error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id),
  foreign key (payment_attempt_id, provider) references public.payment_attempts(id, provider) on delete restrict,
  constraint payment_events_processed_at_check check ((processing_status = 'PROCESSED') = (processed_at is not null))
);
create index payment_events_attempt on public.payment_events(payment_attempt_id);

create table public.purchase_entitlements (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  prompt_id uuid not null references public.prompts(id) on delete restrict,
  source public.entitlement_source not null default 'PACK_SNAPSHOT',
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (purchase_id, prompt_id)
);
create index purchase_entitlements_prompt on public.purchase_entitlements(prompt_id);

create table public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  token_hash bytea not null unique check (octet_length(token_hash) = 32),
  status public.access_token_status not null default 'ACTIVE',
  rotated_from_token_id uuid,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint access_tokens_revoked_at_check check ((status = 'ACTIVE') = (revoked_at is null)),
  unique (id, purchase_id),
  foreign key (rotated_from_token_id, purchase_id) references public.access_tokens(id, purchase_id) on delete restrict
);
create unique index access_tokens_one_active_per_purchase_uidx on public.access_tokens(purchase_id) where status = 'ACTIVE';

create table public.access_sessions (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  session_hash bytea not null unique check (octet_length(session_hash) = 32),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  constraint access_sessions_expiry_check check (expires_at > created_at)
);
create index access_sessions_purchase on public.access_sessions(purchase_id);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete restrict,
  purpose public.email_purpose not null default 'ACCESS_LINK',
  recipient_email_normalized extensions.citext not null check (recipient_email_normalized::text = lower(btrim(recipient_email_normalized::text)) and recipient_email_normalized::text ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  provider text not null,
  provider_message_id text,
  status public.email_delivery_status not null default 'QUEUED',
  attempt_number integer not null default 1 check (attempt_number >= 1),
  safe_error_code text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  constraint email_deliveries_status_at_check check (
    (status not in ('SENT', 'DELIVERED') or sent_at is not null)
    and (status <> 'QUEUED' or sent_at is null)
    and ((status = 'DELIVERED') = (delivered_at is not null))
    and ((status = 'FAILED') = (failed_at is not null))
  )
);
create index email_deliveries_purchase on public.email_deliveries(purchase_id, created_at);

create function public.guard_buyer_terms() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'purchases' then
    if (new.public_reference, new.buyer_email_normalized, new.pack_id, new.pack_title_snapshot, new.amount_minor, new.currency)
       is distinct from (old.public_reference, old.buyer_email_normalized, old.pack_id, old.pack_title_snapshot, old.amount_minor, old.currency) then
      raise exception 'Purchase terms are immutable';
    end if;
    if old.payment_status = 'PAID' and new.payment_status <> 'PAID' then
      raise exception 'Paid purchase cannot regress';
    end if;
  elsif (new.purchase_id, new.provider, new.idempotency_key, new.checkout_claim_hash, new.amount_minor, new.currency)
       is distinct from (old.purchase_id, old.provider, old.idempotency_key, old.checkout_claim_hash, old.amount_minor, old.currency)
       or (old.provider_attempt_id is not null and new.provider_attempt_id is distinct from old.provider_attempt_id) then
    raise exception 'Payment attempt terms are immutable';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_buyer_terms() from public, anon, authenticated;
create trigger purchases_guard_terms before update on public.purchases for each row execute function public.guard_buyer_terms();
create trigger payment_attempts_guard_terms before update on public.payment_attempts for each row execute function public.guard_buyer_terms();

create function public.create_processing_purchase(
  buyer_email extensions.citext, selected_pack_id uuid, payment_provider text,
  reference text, attempt_key text, claim_hash bytea, claim_expires_at timestamptz
) returns table (purchase_id uuid, payment_attempt_id uuid, pack_title text, amount_minor bigint, currency text, saved_claim_expires_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
declare selected_pack public.packs%rowtype;
  existing_provider text;
  existing_claim_hash bytea;
  existing_reference text;
  existing_email extensions.citext;
  existing_pack_id uuid;
begin
  if buyer_email is null or buyer_email::text <> pg_catalog.lower(pg_catalog.btrim(buyer_email::text))
    or buyer_email::text !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    or selected_pack_id is null or payment_provider !~ '^[a-z][a-z0-9_-]{1,63}$'
    or pg_catalog.length(reference) < 32 or pg_catalog.length(attempt_key) < 16
    or pg_catalog.octet_length(claim_hash) <> 32 or claim_expires_at is null or claim_expires_at <= now()
    or payment_provider is null or reference is null or attempt_key is null or claim_hash is null then
    raise exception 'Invalid checkout initialization';
  end if;
  -- Serialize retries for the same key before inserting either row.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(attempt_key, 0));
  select a.purchase_id, a.id, p.pack_title_snapshot, p.amount_minor, p.currency, a.expires_at,
         a.provider, a.checkout_claim_hash, p.public_reference, p.buyer_email_normalized, p.pack_id
    into purchase_id, payment_attempt_id, pack_title, amount_minor, currency, saved_claim_expires_at,
         existing_provider, existing_claim_hash, existing_reference, existing_email, existing_pack_id
    from public.payment_attempts a join public.purchases p on p.id = a.purchase_id
    where a.idempotency_key = attempt_key;
  if found then
    if (existing_provider, existing_claim_hash, existing_reference, existing_email, existing_pack_id)
        is distinct from (payment_provider, claim_hash, reference, buyer_email, selected_pack_id) then
      raise exception 'Checkout idempotency key conflict';
    end if;
    if saved_claim_expires_at is null or saved_claim_expires_at <= now() then raise exception 'Checkout claim expired'; end if;
    return next;
    return;
  end if;
  select * into selected_pack from public.packs where id = selected_pack_id and status = 'PUBLISHED' for share;
  if not found then raise exception 'Prompt Pack unavailable'; end if;
  insert into public.purchases (public_reference, buyer_email_normalized, pack_id, pack_title_snapshot, amount_minor, currency)
    values (reference, buyer_email, selected_pack_id, selected_pack.title, selected_pack.price_minor, selected_pack.currency)
    returning id into purchase_id;
  insert into public.payment_attempts (purchase_id, provider, idempotency_key, checkout_claim_hash, amount_minor, currency, expires_at)
    values (purchase_id, payment_provider, attempt_key, claim_hash, selected_pack.price_minor, selected_pack.currency, claim_expires_at)
    returning id, expires_at into payment_attempt_id, saved_claim_expires_at;
  pack_title := selected_pack.title;
  amount_minor := selected_pack.price_minor;
  currency := selected_pack.currency;
  return next;
end;
$$;
revoke all on function public.create_processing_purchase(extensions.citext, uuid, text, text, text, bytea, timestamptz) from public, anon, authenticated;
grant execute on function public.create_processing_purchase(extensions.citext, uuid, text, text, text, bytea, timestamptz) to service_role;

revoke all on public.purchases, public.payment_attempts, public.payment_events, public.purchase_entitlements,
  public.access_tokens, public.access_sessions, public.email_deliveries from public, anon, authenticated;
alter table public.purchases enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_events enable row level security;
alter table public.purchase_entitlements enable row level security;
alter table public.access_tokens enable row level security;
alter table public.access_sessions enable row level security;
alter table public.email_deliveries enable row level security;
