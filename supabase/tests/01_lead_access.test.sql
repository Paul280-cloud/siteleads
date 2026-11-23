begin;
select plan(3);

-- A caller must not see a lead that isn't assigned to them.
select ok(
  not exists (
    select 1 from pg_policies
    where tablename = 'leads' and cmd = 'SELECT' and policyname = 'caller reads own leads'
      and qual not like '%assigned_to%'
  ),
  'caller select policy is scoped to assigned_to'
);

-- Direct UPDATE on leads must not be open (status changes go through update_lead_status()).
select ok(
  not exists (
    select 1 from pg_policies where tablename = 'leads' and cmd = 'UPDATE'
  ),
  'no direct UPDATE policy exists on leads'
);

-- assign_lead() must be security definer (so it can check role across rows safely).
select ok(
  (select prosecdef from pg_proc where proname = 'assign_lead'),
  'assign_lead is security definer'
);

select * from finish();
rollback;
