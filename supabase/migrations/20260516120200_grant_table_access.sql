-- Grant table-level privileges to the PostgREST roles.
--
-- The project was created with "Automatically expose new tables" disabled,
-- so exposure is opt-in per table. RLS still gates which rows each role
-- sees once a GRANT lets the role reach the table at all.
--
-- service_role  : bypasses RLS, used server-side. Full DML on everything.
-- authenticated : signed-in users. SELECT everywhere (RLS filters), plus
--                 writes only on tables consumers actually mutate.
-- anon          : unauthenticated visitors. SELECT only.

grant usage on schema public to anon, authenticated;

-- Service role: full access (used in server actions, edge functions, scripts).
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Public read for the consumer marketplace. RLS already restricts each table
-- to published businesses / own profile / etc.
grant select on
  public.profiles,
  public.businesses,
  public.business_members,
  public.services,
  public.service_staff,
  public.weekly_hours,
  public.hours_exceptions,
  public.reviews,
  public.favorites
to anon, authenticated;

-- Authenticated writes — limited to the tables consumers can mutate today.
grant insert, delete on public.favorites to authenticated;
grant update         on public.profiles  to authenticated;

-- Future tables created under public inherit the same exposure shape.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
