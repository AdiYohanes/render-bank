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

create function public.audit_admin_publication() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status and (select auth.uid()) is not null then
    insert into public.admin_audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    values ((select auth.uid()),
      (case when tg_table_name = 'prompts' then 'PROMPT_' else 'PACK_' end) || new.status::text,
      case when tg_table_name = 'prompts' then 'PROMPT' else 'PACK' end,
      new.id, pg_catalog.jsonb_build_object('previous_status', old.status::text, 'status', new.status::text));
  end if;
  return new;
end;
$$;
revoke all on function public.audit_admin_publication() from public, anon, authenticated;
create trigger prompts_audit_publication after update of status on public.prompts
  for each row execute function public.audit_admin_publication();
create trigger packs_audit_publication after update of status on public.packs
  for each row execute function public.audit_admin_publication();
