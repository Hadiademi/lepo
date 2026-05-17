-- Phase 2 — Bookings, booking_services, notifications.
--
-- This migration adds the booking-flow tables and the single most important
-- constraint in the system: a Postgres EXCLUDE-using-gist constraint that
-- prevents two pending/confirmed bookings from overlapping for the same staff
-- member under concurrent inserts. Application-level checks are racy; the
-- database is the only place where we can win this invariant cleanly.
--
-- It also wires the deferred reviews.booking_id FK (kept nullable for now so
-- the Phase 1 seeded reviews survive; new reviews created from real bookings
-- will set it).

create extension if not exists btree_gist with schema extensions;

-- ============================================================================
-- bookings
-- ============================================================================
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id),
  staff_user_id  uuid not null references public.profiles(id),
  client_user_id uuid not null references public.profiles(id),

  -- Time range INCLUDES buffer_after_min — the full block the staff is busy.
  -- Bounds are [start, end) so back-to-back bookings can share an instant.
  time_range     tstzrange not null,

  status         text not null default 'confirmed'
                   check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),

  client_notes   text,
  total_cents    int  not null check (total_cents >= 0),
  deposit_cents  int  not null default 0 check (deposit_cents >= 0),
  stripe_pi_id   text,

  cancelled_at   timestamptz,
  cancelled_by   uuid references public.profiles(id),
  cancel_reason  text,

  created_at     timestamptz not null default now()
);

create index bookings_business_idx on public.bookings (business_id, lower(time_range));
create index bookings_client_idx   on public.bookings (client_user_id, lower(time_range) desc);
create index bookings_staff_idx    on public.bookings (staff_user_id, lower(time_range));

-- The anti-overlap invariant. Only pending + confirmed bookings count; cancelled
-- and no_show free up the slot. btree_gist required for "with =" on uuid.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    staff_user_id with =,
    time_range    with &&
  )
  where (status in ('pending', 'confirmed'));

-- ============================================================================
-- booking_services
-- Snapshot of services at booking time (price + duration + VAT may drift later).
-- ============================================================================
create table public.booking_services (
  booking_id      uuid not null references public.bookings(id) on delete cascade,
  service_id      uuid not null references public.services(id),
  name_at_booking text not null,
  duration_min    int  not null check (duration_min > 0),
  price_cents     int  not null check (price_cents >= 0),
  vat_rate        numeric(5,4) not null,

  primary key (booking_id, service_id)
);

create index booking_services_service_idx on public.booking_services (service_id);

-- ============================================================================
-- notifications outbox
-- ============================================================================
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id),
  channel     text not null check (channel in ('email', 'sms', 'push')),
  template    text not null,
  payload     jsonb not null,
  send_after  timestamptz not null default now(),
  sent_at     timestamptz,
  attempts    int  not null default 0,
  last_error  text,
  created_at  timestamptz not null default now()
);

create index notifications_pending_idx on public.notifications (send_after) where sent_at is null;

-- ============================================================================
-- reviews.booking_id (deferred from Phase 1)
-- Nullable for now so seeded reviews survive; uniqueness enforced via partial
-- index on the non-null subset. New review inserts from finished bookings will
-- set booking_id; Phase 1 demo reviews leave it null.
-- ============================================================================
alter table public.reviews
  add column booking_id uuid references public.bookings(id) on delete cascade;

create unique index reviews_booking_unique
  on public.reviews (booking_id)
  where booking_id is not null;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.bookings         enable row level security;
alter table public.booking_services enable row level security;
alter table public.notifications    enable row level security;

-- ---- bookings -------------------------------------------------------------
-- A client sees only their own bookings; business members see every booking
-- at the businesses they belong to.
create policy "bookings_select_own_or_business"
  on public.bookings for select
  using (
    client_user_id = auth.uid()
    or exists (
      select 1 from public.business_members m
      where m.business_id = bookings.business_id
        and m.user_id = auth.uid()
    )
  );

-- A signed-in user inserts a booking for themselves only.
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (client_user_id = auth.uid());

-- The client can update their own booking (used for cancellation).
create policy "bookings_update_own"
  on public.bookings for update
  using (client_user_id = auth.uid())
  with check (client_user_id = auth.uid());

-- Business members can update bookings at their business (confirm, complete,
-- cancel, mark no-show).
create policy "bookings_update_by_business"
  on public.bookings for update
  using (
    exists (
      select 1 from public.business_members m
      where m.business_id = bookings.business_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.business_members m
      where m.business_id = bookings.business_id
        and m.user_id = auth.uid()
    )
  );

-- ---- booking_services -----------------------------------------------------
create policy "booking_services_select_via_booking"
  on public.booking_services for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_services.booking_id
        and (
          b.client_user_id = auth.uid()
          or exists (
            select 1 from public.business_members m
            where m.business_id = b.business_id and m.user_id = auth.uid()
          )
        )
    )
  );

create policy "booking_services_insert_via_own_booking"
  on public.booking_services for insert
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_services.booking_id
        and b.client_user_id = auth.uid()
    )
  );

-- ---- notifications --------------------------------------------------------
-- Recipients see their own messages; inserts/updates flow through service_role
-- in the dispatcher edge function.
create policy "notifications_select_own"
  on public.notifications for select
  using (user_id = auth.uid());

-- ============================================================================
-- GRANTs
-- The default privileges from migration 20260516120200 hand SELECT to anon on
-- new tables. That is wrong for booking data — revoke explicitly and re-grant
-- the surface each role actually needs.
-- ============================================================================

revoke all on public.bookings         from anon, authenticated;
revoke all on public.booking_services from anon, authenticated;
revoke all on public.notifications    from anon, authenticated;

grant all on public.bookings         to service_role;
grant all on public.booking_services to service_role;
grant all on public.notifications    to service_role;

grant select, insert, update on public.bookings to authenticated;
grant select, insert         on public.booking_services to authenticated;
grant select                 on public.notifications to authenticated;
