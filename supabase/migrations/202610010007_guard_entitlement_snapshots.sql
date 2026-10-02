create function public.guard_entitlement_snapshot() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Entitlement snapshot is immutable';
  end if;
  if (new.id, new.purchase_id, new.prompt_id, new.source, new.granted_at)
     is distinct from (old.id, old.purchase_id, old.prompt_id, old.source, old.granted_at) then
    raise exception 'Entitlement snapshot is immutable';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_entitlement_snapshot() from public, anon, authenticated;
create trigger purchase_entitlements_guard_snapshot
  before update or delete on public.purchase_entitlements
  for each row execute function public.guard_entitlement_snapshot();
