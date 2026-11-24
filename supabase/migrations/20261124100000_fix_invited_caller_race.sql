-- Fix: the previous version of this trigger decided owner-vs-caller by
-- reading app_metadata at INSERT time. In practice, Supabase's Auth server
-- does not always have app_metadata attached to the row at that instant for
-- admin-created users, so an invited caller was getting the default
-- "new signup" treatment (its own agency, role owner) instead of joining the
-- inviting agency as a caller.
--
-- Fix: any admin-created user (the invite-caller Edge Function marks these
-- with an app_metadata "role" key) skips this trigger entirely. The Edge
-- Function inserts that user's profile row itself, right after creating the
-- account, with no race condition possible.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_agency_id uuid;
begin
  if new.raw_app_meta_data ? 'role' then
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
