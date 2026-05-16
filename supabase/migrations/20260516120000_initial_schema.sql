-- Phase 1 — Consumer marketplace foundation.
-- Tables: profiles, businesses, business_members, services, service_staff,
--         weekly_hours, hours_exceptions, reviews, favorites.
-- Bookings + the EXCLUDE overlap constraint land in Phase 2.

create extension if not exists postgis with schema extensions;

-- ============================================================================
-- profiles (1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  phone_e164  text,
  avatar_url  text,
  role        text not null default 'client' check (role in ('client','partner','admin')),
  locale      text not null default 'sl',
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Stranka'),
    coalesce(new.raw_user_meta_data->>'locale', 'sl')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- businesses (salons)
-- ============================================================================
create table public.businesses (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text,
  tier              text not null default 'standard' check (tier in ('standard','premium')),
  city              text not null,
  neighborhood      text,
  address           text not null,
  geo               extensions.geography(point, 4326),
  phone_e164        text,
  email             text,
  cover_url         text,
  vat_id            text,
  stripe_account_id text,
  created_at        timestamptz not null default now(),
  published_at      timestamptz
);

create index businesses_geo_idx       on public.businesses using gist (geo);
create index businesses_published_idx on public.businesses (published_at) where published_at is not null;
create index businesses_city_idx      on public.businesses (city);

-- ============================================================================
-- business_members (staff at a business, including owners)
-- ============================================================================
create table public.business_members (
  business_id  uuid not null references public.businesses(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         text not null check (role in ('owner','staff')),
  display_name text not null,
  avatar_url   text,
  bio          text,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index business_members_user_idx on public.business_members (user_id);

-- ============================================================================
-- services (what a salon offers)
-- ============================================================================
create table public.services (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  name             text not null,
  description      text,
  duration_min     int  not null check (duration_min > 0),
  buffer_after_min int  not null default 0 check (buffer_after_min >= 0),
  price_cents      int  not null check (price_cents >= 0),
  vat_rate         numeric(5,4) not null default 0.095,
  category         text,
  active           boolean not null default true,
  sort_order       int  not null default 0,
  created_at       timestamptz not null default now()
);

create index services_business_idx on public.services (business_id) where active;

-- ============================================================================
-- service_staff (which staff perform which service)
-- ============================================================================
create table public.service_staff (
  service_id uuid not null references public.services(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (service_id, user_id)
);

create index service_staff_user_idx on public.service_staff (user_id);

-- ============================================================================
-- weekly_hours (recurring per weekday; user_id null = business-wide)
-- ============================================================================
create table public.weekly_hours (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  weekday     int  not null check (weekday between 0 and 6),  -- 0 = Monday
  starts_at   time not null,
  ends_at     time not null,
  check (ends_at > starts_at)
);

create index weekly_hours_business_weekday_idx on public.weekly_hours (business_id, weekday);

-- ============================================================================
-- hours_exceptions (date overrides for holidays, vacation, special hours)
-- ============================================================================
create table public.hours_exceptions (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  date        date not null,
  closed      boolean not null default false,
  starts_at   time,
  ends_at     time,
  reason      text,
  check (closed or (starts_at is not null and ends_at is not null and ends_at > starts_at))
);

create index hours_exceptions_business_date_idx on public.hours_exceptions (business_id, date);

-- ============================================================================
-- reviews
--   booking_id (NOT NULL + unique FK to bookings) is added in Phase 2 once the
--   bookings table exists. For Phase 1 reviews are seeded for display.
-- ============================================================================
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  client_user_id uuid references public.profiles(id),
  reviewer_name  text not null,
  rating         int  not null check (rating between 1 and 5),
  body           text,
  created_at     timestamptz not null default now(),
  published      boolean not null default true
);

create index reviews_business_idx on public.reviews (business_id) where published;

-- ============================================================================
-- favorites
-- ============================================================================
create table public.favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, business_id)
);

create index favorites_business_idx on public.favorites (business_id);

-- ============================================================================
-- Row Level Security
--   Phase 1 scope is consumer-facing READ. Partner write policies arrive in
--   Phase 3. Without an explicit policy, a table is unreachable — that is the
--   desired default for anything not enumerated here.
-- ============================================================================

alter table public.profiles         enable row level security;
alter table public.businesses       enable row level security;
alter table public.business_members enable row level security;
alter table public.services         enable row level security;
alter table public.service_staff    enable row level security;
alter table public.weekly_hours     enable row level security;
alter table public.hours_exceptions enable row level security;
alter table public.reviews          enable row level security;
alter table public.favorites        enable row level security;

-- profiles --------------------------------------------------------------------
create policy "profiles_self_read"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- businesses ------------------------------------------------------------------
create policy "businesses_public_read_published"
  on public.businesses for select
  using (published_at is not null);

-- business_members ------------------------------------------------------------
-- Public can see members of published businesses (used to render staff on the
-- salon page). display_name + avatar_url on this table shadow the underlying
-- profile so we never expose profiles publicly.
create policy "business_members_public_read"
  on public.business_members for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_members.business_id
        and b.published_at is not null
    )
  );

-- services --------------------------------------------------------------------
create policy "services_public_read_active"
  on public.services for select
  using (
    active
    and exists (
      select 1 from public.businesses b
      where b.id = services.business_id
        and b.published_at is not null
    )
  );

-- service_staff ---------------------------------------------------------------
create policy "service_staff_public_read"
  on public.service_staff for select
  using (
    exists (
      select 1
      from public.services s
      join public.businesses b on b.id = s.business_id
      where s.id = service_staff.service_id
        and s.active
        and b.published_at is not null
    )
  );

-- weekly_hours ----------------------------------------------------------------
create policy "weekly_hours_public_read"
  on public.weekly_hours for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = weekly_hours.business_id
        and b.published_at is not null
    )
  );

-- hours_exceptions ------------------------------------------------------------
create policy "hours_exceptions_public_read"
  on public.hours_exceptions for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = hours_exceptions.business_id
        and b.published_at is not null
    )
  );

-- reviews ---------------------------------------------------------------------
create policy "reviews_public_read"
  on public.reviews for select
  using (
    published
    and exists (
      select 1 from public.businesses b
      where b.id = reviews.business_id
        and b.published_at is not null
    )
  );

-- favorites -------------------------------------------------------------------
create policy "favorites_owner_read"
  on public.favorites for select
  using (user_id = auth.uid());

create policy "favorites_owner_write"
  on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
