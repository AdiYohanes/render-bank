create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (length(btrim(action)) > 0),
  entity_type text not null check (length(btrim(entity_type)) > 0),
  entity_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index admin_audit_logs_entity on public.admin_audit_logs(entity_type, entity_id, created_at desc);
create index admin_audit_logs_actor on public.admin_audit_logs(actor_user_id, created_at desc);
revoke all on public.admin_audit_logs from public, anon, authenticated;
alter table public.admin_audit_logs enable row level security;
grant select, insert on public.admin_audit_logs to service_role;

create function public.preserve_admin_audit_log() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Admin audit history is immutable';
end;
$$;
revoke all on function public.preserve_admin_audit_log() from public, anon, authenticated;
create trigger admin_audit_logs_immutable before update or delete on public.admin_audit_logs
  for each row execute function public.preserve_admin_audit_log();
