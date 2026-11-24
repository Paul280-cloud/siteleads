-- Add optional map coordinates to leads, for the owner's map view (F7).
-- Nullable: existing leads and manual entry without coordinates still work,
-- the map view just skips leads with no location set.

alter table public.leads
  add column lat double precision,
  add column lng double precision;
