-- Invited callers.
--
-- Public sign-up always creates a new agency + owner. A caller can only be
-- created by the invite-caller Edge Function (service role), which sets
-- role and agency_id in app_metadata. app_metadata cannot be set by a normal
-- client, so nobody can promote themselves or join another agency by putting
-- values in user_metadata at sign-up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_agency_id uuid;
  invited_role text := new.raw_app_meta_data->>'role';
  invited_agency uuid := nullif(new.raw_app_meta_data->>'agency_id', '')::uuid;
begin
  if invited_role = 'caller' and invited_agency is not null then
    insert into public.profiles (id, email, full_name, role, agency_id)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      'caller',
      invited_agency
    );
    return new;
  end if;

  insert into public.agencies (name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'agency_name', 'My Agency'), new.id)
  returning id into new_agency_id;

  insert into public.profiles (id, email, full_name, role, agency_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'owner',
    new_agency_id
  );

  return new;
end;
$$;
