-- SiteLeads core schema: agencies, profiles, leads, lead_notes
-- Pattern: RLS on every table, security definer functions for cross-row actions,
-- search_path pinned to '' on every function (prevents search_path hijacking).

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('owner', 'caller')),
  agency_id uuid references public.agencies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  business_name text not null,
  category text,
  area text,
  phone text,
  source text default 'manual',
  has_website boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'interested', 'converted', 'not_interested')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);

-- Helper: current user's agency_id, bypassing RLS recursion.
create function public.my_agency_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select agency_id from public.profiles where id = auth.uid();
$$;

-- Helper: current user's role.
create function public.my_role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- On signup, create an agency + owner profile from user metadata.
-- Expects raw_user_meta_data: { "full_name": "...", "agency_name": "..." }
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_agency_id uuid;
begin
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Assign a lead to a caller. Only the agency owner can do this, and only
-- within their own agency.
create function public.assign_lead(p_lead_id uuid, p_caller_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.my_role() <> 'owner' then
    raise exception 'Only an agency owner can assign leads';
  end if;

  if not exists (
    select 1 from public.leads
    where id = p_lead_id and agency_id = public.my_agency_id()
  ) then
    raise exception 'Lead not found in your agency';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_caller_id and agency_id = public.my_agency_id() and role = 'caller'
  ) then
    raise exception 'Caller not found in your agency';
  end if;

  update public.leads set assigned_to = p_caller_id where id = p_lead_id;
end;
$$;

-- Update a lead's status + add a note. Only the caller it is assigned to
-- may call this (an owner reassigning status is a fast-follow, not MVP).
create function public.update_lead_status(p_lead_id uuid, p_status text, p_note text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('new', 'contacted', 'interested', 'converted', 'not_interested') then
    raise exception 'Invalid status';
  end if;

  if not exists (
    select 1 from public.leads
    where id = p_lead_id and assigned_to = auth.uid()
  ) then
    raise exception 'You can only update leads assigned to you';
  end if;

  update public.leads set status = p_status where id = p_lead_id;

  if p_note is not null and length(trim(p_note)) > 0 then
    insert into public.lead_notes (lead_id, author_id, note)
    values (p_lead_id, auth.uid(), p_note);
  end if;
end;
$$;

-- Row Level Security

alter table public.agencies enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;

-- agencies: members can see their own agency only.
create policy "agency members can read their agency"
  on public.agencies for select
  using (id = public.my_agency_id());

-- profiles: a user can always read their own profile; agency members can
-- read each other's profiles (needed for assignment UI and "leads per caller").
create policy "read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "read agency teammates"
  on public.profiles for select
  using (agency_id = public.my_agency_id());

-- leads: owners see every lead in their agency; callers see only their own.
create policy "owner reads agency leads"
  on public.leads for select
  using (agency_id = public.my_agency_id() and public.my_role() = 'owner');

create policy "caller reads own leads"
  on public.leads for select
  using (assigned_to = auth.uid());

create policy "owner inserts leads"
  on public.leads for insert
  with check (agency_id = public.my_agency_id() and public.my_role() = 'owner');

-- Direct row updates are intentionally NOT allowed by policy for status/assignment;
-- those go through assign_lead() and update_lead_status() (security definer, revoke-then-grant below).

-- lead_notes: readable by anyone who can read the parent lead.
create policy "read notes on visible leads"
  on public.lead_notes for select
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (l.assigned_to = auth.uid() or (l.agency_id = public.my_agency_id() and public.my_role() = 'owner'))
    )
  );

-- Revoke-then-grant: functions are callable by authenticated users only;
-- the functions themselves enforce who can actually do what.
revoke all on function public.assign_lead(uuid, uuid) from public;
grant execute on function public.assign_lead(uuid, uuid) to authenticated;

revoke all on function public.update_lead_status(uuid, text, text) from public;
grant execute on function public.update_lead_status(uuid, text, text) to authenticated;

revoke all on function public.my_agency_id() from public;
grant execute on function public.my_agency_id() to authenticated;

revoke all on function public.my_role() from public;
grant execute on function public.my_role() to authenticated;
