begin;
select plan(3);

-- Owner A signs up normally: gets their own agency.
insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'owner-a@example.com',
  '{"full_name":"Owner A","agency_name":"Agency A"}',
  '{}'
);

-- B tries to become a caller of Agency A by putting values in user_metadata
-- (all a public sign-up can control). This must be ignored.
insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'sneaky@example.com',
  jsonb_build_object(
    'full_name', 'Sneaky',
    'role', 'caller',
    'agency_id', (select agency_id from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
  ),
  '{}'
);

-- An admin-created user (app_metadata has a "role" key, the way
-- invite-caller marks it) must NOT get the default owner/agency treatment.
-- Its profile is created by the Edge Function itself, not this trigger.
insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'caller@example.com',
  '{"full_name":"Caller C"}',
  '{"role":"caller","agency_id":"00000000-0000-0000-0000-000000000000"}'
);

select is(
  (select role from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  'owner',
  'user_metadata cannot make a public sign-up a caller'
);

select isnt(
  (select agency_id from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  (select agency_id from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'user_metadata cannot put a sign-up into another agency'
);

select ok(
  not exists (select 1 from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'an admin-created user (app_metadata has a role key) gets no profile from this trigger'
);

select * from finish();
rollback;
