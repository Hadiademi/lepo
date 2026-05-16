# PRODUCTION BUILD PROMPT — Lepo (Slovenian Beauty Booking Marketplace)

> **Purpose of this document:** A single, self-contained brief that an experienced full-stack engineer (or a capable AI coding agent) can read once and use to build the production application end-to-end. It encodes the design intent of the existing prototype, the technical decisions already made, the domain pitfalls specific to booking marketplaces, and the production quality bar. Read it linearly the first time. Refer back to specific sections during execution.

---

## 1. Product summary

**Lepo** is a mobile-first booking marketplace for premium beauty and barber salons in Slovenia. Clients discover salons, select services, book a specific time slot with a specific staff member, optionally pay a deposit, and receive automated confirmations and reminders. Salon owners receive bookings into a dashboard, manage staff and availability, and get paid out via Stripe.

**Positioning:** premium, calm, editorial. Not a discount aggregator. Not Booksy. Closer to Resy (restaurants) in tone — fewer, better salons, higher trust.

**Primary market:** Slovenia. Primary language: Slovenian (`sl-SI`). Currency: EUR. Timezone: `Europe/Ljubljana`. All copy, legal pages, invoices, and notifications must be in Slovenian by default. English is a secondary locale, not a fallback.

**Two distinct user surfaces:**

1. **Consumer app** (`lepo.si`) — discovery, booking, profile
2. **Salon dashboard** (`partner.lepo.si` or `lepo.si/partner`) — calendar, bookings, staff, services, hours, payouts

Both share the same Next.js codebase, separated by route group and auth role.

---

## 2. Inputs available to the implementer

| Input                   | Location                                                                                                    | Status                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Visual design prototype | `index.html` + `screens-1.jsx`, `screens-2.jsx`, `app.jsx`, `components.jsx`, `tokens.jsx`, `ios-frame.jsx` | Authoritative for consumer-side visuals         |
| Design tokens           | `tokens.jsx` and the palette/typography section in `CLAUDE.md`                                              | Authoritative                                   |
| Slovenian copy          | Inline in the prototype screens                                                                             | Authoritative for the screens it covers         |
| Salon dashboard design  | **Not yet designed**                                                                                        | To be produced; follow the same design language |
| Brand mark              | `L` lockup in Fraunces italic, gold gradient (see `screens-1.jsx` SplashScreen)                             | Authoritative                                   |

The prototype covers: Splash, Onboarding (3 slides), Home, Search, Map, Barber profile, Booking step 1 (services), Booking step 2 (date/time), Confirmation, MyBookings, ProfileMe.

The prototype does **not** cover: Auth screens, salon dashboard (any of it), reviews submission, payment, settings detail screens, error states, empty states, push permission, GDPR consent, partner onboarding. These must be designed to match the existing language before implementation.

---

## 3. Tech stack — do not deviate

The stack is fixed. Each choice was made deliberately. Substitutions require explicit user approval. The full list lives in `CLAUDE.md` (§ "Target production stack"); the most important reaffirmations:

- **Next.js 15 App Router + TypeScript strict + Tailwind v4 + shadcn/ui + Framer Motion**
- **Supabase Postgres + Supabase Auth + Supabase Storage + Supabase Realtime** (EU/Frankfurt region — required for GDPR)
- **Stripe** (with Stripe Tax for Slovenian VAT) + **Resend** (email) + **MessageBird** (SMS)
- **Vercel** hosting + **Sentry** (errors) + **PostHog EU** (analytics)
- Package manager: **pnpm**. Node: **22 LTS**.

---

## 4. Repository layout

```
lepo/
├── apps/
│   └── web/                      # Single Next.js app, two route groups
│       ├── src/
│       │   ├── app/
│       │   │   ├── (consumer)/   # Public marketplace
│       │   │   │   ├── page.tsx
│       │   │   │   ├── iskanje/
│       │   │   │   ├── salon/[slug]/
│       │   │   │   ├── rezervacija/
│       │   │   │   └── profil/
│       │   │   ├── (partner)/    # Salon dashboard
│       │   │   │   ├── partner/
│       │   │   │   │   ├── koledar/
│       │   │   │   │   ├── storitve/
│       │   │   │   │   ├── ekipa/
│       │   │   │   │   └── nastavitve/
│       │   │   ├── (auth)/
│       │   │   ├── api/
│       │   │   │   ├── stripe/webhook/
│       │   │   │   ├── messagebird/webhook/
│       │   │   │   └── cron/
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/           # shadcn primitives
│       │   │   ├── booking/
│       │   │   ├── salon/
│       │   │   └── shared/
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   │   ├── client.ts
│       │   │   │   ├── server.ts
│       │   │   │   └── types.ts  # generated
│       │   │   ├── stripe/
│       │   │   ├── email/
│       │   │   ├── sms/
│       │   │   ├── availability.ts  # core slot computation
│       │   │   └── i18n/
│       │   ├── server/
│       │   │   └── actions/      # Server actions, grouped by domain
│       │   └── styles/
│       └── messages/
│           ├── sl.json
│           └── en.json
├── supabase/
│   ├── migrations/               # Versioned SQL
│   ├── functions/                # Edge functions (reminders cron, payouts)
│   └── seed.sql                  # Slovenian holidays, demo data
├── packages/
│   ├── emails/                   # React Email templates
│   └── config/                   # Shared ESLint, TS, Tailwind config
├── .github/workflows/
│   ├── ci.yml
│   └── preview.yml
├── playwright/                   # E2E specs
├── CLAUDE.md
└── PRODUCTION_PROMPT.md
```

A monorepo via pnpm workspaces is intentional even with a single app today — the `emails` package and a future `mobile` Expo app justify it.

---

## 5. Database schema (Postgres, via Supabase migrations)

This is the canonical schema. Implement it in a first migration. All tables `snake_case`, all primary keys `uuid default gen_random_uuid()`, all timestamps `timestamptz`.

### Core tables

```sql
-- Profiles (1:1 with auth.users, extends Supabase auth)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  phone_e164   text,                          -- +386...
  avatar_url   text,
  role         text not null default 'client' check (role in ('client','partner','admin')),
  locale       text not null default 'sl',
  created_at   timestamptz not null default now()
);

-- Businesses (salons)
create table public.businesses (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,        -- used in /salon/[slug]
  name           text not null,
  description    text,
  tier           text not null default 'standard' check (tier in ('standard','premium')),
  city           text not null,
  address        text not null,
  geo            geography(point, 4326),      -- lat/lng for map search
  phone_e164     text,
  email          text,
  cover_url      text,
  vat_id         text,                        -- SI########
  stripe_account_id text,                     -- Stripe Connect
  created_at     timestamptz not null default now(),
  published_at   timestamptz
);
create index on public.businesses using gist (geo);

-- Members (staff at a business — including owner)
create table public.business_members (
  business_id  uuid references public.businesses(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  role         text not null check (role in ('owner','staff')),
  display_name text not null,
  avatar_url   text,
  primary key (business_id, user_id)
);

-- Services offered
create table public.services (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  name            text not null,
  description     text,
  duration_min    int  not null check (duration_min > 0),
  buffer_after_min int not null default 0 check (buffer_after_min >= 0),
  price_cents     int  not null check (price_cents >= 0),
  vat_rate        numeric(5,4) not null default 0.095,   -- 9.5% reduced rate; verify per service
  category        text,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Which staff can perform which service
create table public.service_staff (
  service_id uuid references public.services(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  primary key (service_id, user_id)
);

-- Weekly recurring hours per staff member (and per business as a fallback)
create table public.weekly_hours (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,  -- null = business-wide
  weekday      int not null check (weekday between 0 and 6),            -- 0 = Monday
  starts_at    time not null,
  ends_at      time not null,
  check (ends_at > starts_at)
);

-- Date-specific overrides (holidays, vacation, special hours)
create table public.hours_exceptions (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  date         date not null,
  closed       boolean not null default false,
  starts_at    time,
  ends_at      time,
  reason       text
);

-- Bookings (the hot table)
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id),
  staff_user_id   uuid not null references public.profiles(id),
  client_user_id  uuid not null references public.profiles(id),
  -- Time range with buffer included; used for conflict checks.
  time_range      tstzrange not null,
  status          text not null default 'confirmed'
                   check (status in ('pending','confirmed','completed','cancelled','no_show')),
  client_notes    text,
  total_cents     int not null,
  deposit_cents   int not null default 0,
  stripe_pi_id    text,
  cancelled_at    timestamptz,
  cancelled_by    uuid references public.profiles(id),
  cancel_reason   text,
  created_at      timestamptz not null default now()
);

-- Prevent overlapping confirmed bookings for the same staff member.
-- This is the single most important constraint in the system.
create extension if not exists btree_gist;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    staff_user_id with =,
    time_range with &&
  ) where (status in ('pending','confirmed'));

-- Booking lines (services included in a booking)
create table public.booking_services (
  booking_id  uuid references public.bookings(id) on delete cascade,
  service_id  uuid references public.services(id),
  -- Snapshot price/duration at booking time (services can change later)
  name_at_booking      text not null,
  duration_min         int not null,
  price_cents          int not null,
  vat_rate             numeric(5,4) not null,
  primary key (booking_id, service_id)
);

-- Reviews (one per completed booking)
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null unique references public.bookings(id) on delete cascade,
  business_id  uuid not null references public.businesses(id) on delete cascade,
  client_user_id uuid not null references public.profiles(id),
  rating       int  not null check (rating between 1 and 5),
  body         text,
  created_at   timestamptz not null default now(),
  published    boolean not null default true
);

-- Favorites
create table public.favorites (
  user_id     uuid references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, business_id)
);

-- Notifications outbox (durable; consumed by edge function)
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id),
  channel      text not null check (channel in ('email','sms','push')),
  template     text not null,
  payload      jsonb not null,
  send_after   timestamptz not null default now(),
  sent_at      timestamptz,
  attempts     int not null default 0,
  last_error   text
);
create index on public.notifications (send_after) where sent_at is null;
```

### Row Level Security (mandatory)

Every table above gets `alter table … enable row level security`. Sample policies:

```sql
-- Clients see their own bookings; staff see bookings at their business.
create policy "bookings_select" on public.bookings for select using (
  client_user_id = auth.uid()
  or exists (
    select 1 from public.business_members m
    where m.business_id = bookings.business_id and m.user_id = auth.uid()
  )
);

-- Only the assigned staff or business owner can update a booking's status.
create policy "bookings_update_status" on public.bookings for update using (
  exists (
    select 1 from public.business_members m
    where m.business_id = bookings.business_id and m.user_id = auth.uid()
  )
);

-- Public can read published businesses; partners can edit their own.
create policy "businesses_public_read" on public.businesses for select using (published_at is not null);
create policy "businesses_owner_write" on public.businesses for all using (
  exists (
    select 1 from public.business_members m
    where m.business_id = businesses.id and m.user_id = auth.uid() and m.role = 'owner'
  )
);
```

Apply RLS for **every** table. A table without an explicit policy is unreachable from the client — this is the desired default.

---

## 6. Availability computation (the hard part)

Most booking-app bugs live here. Implement once, in [src/lib/availability.ts](apps/web/src/lib/availability.ts), and treat it as load-bearing.

**Inputs:** `business_id`, `service_ids[]`, `staff_user_id?` (optional), `date_range`, client timezone.

**Algorithm:**

1. Compute total `duration_min` + `buffer_after_min` for the requested services.
2. Identify candidate staff (intersection of `service_staff` across all requested services). If `staff_user_id` provided, restrict to that one.
3. For each candidate staff member and each date in the range:
   a. Resolve working window: `hours_exceptions` for that date if any, otherwise `weekly_hours` for that weekday, otherwise none.
   b. Subtract existing bookings (`status in ('pending','confirmed')`, `staff_user_id = X`, `time_range && date_window`).
   c. Enumerate start times in 15-min increments (configurable) that fit the total duration without spilling outside the working window or into another booking.
4. Convert to client timezone for display.
5. Merge across staff if no specific staff requested — show the union, deduplicate by start time, remember which staff ID corresponds to each slot.

**Do not cache slot lists eagerly.** Compute on read, with a short-lived `revalidate: 30` for the public salon page and `no-store` for the active booking flow.

**Atomicity of booking creation:**

```sql
-- In a server action:
begin;
  -- Re-check availability inside the transaction
  -- Insert booking; the EXCLUDE constraint will fail if a race occurred
  insert into public.bookings (...) values (...);
  -- Snapshot service lines
  insert into public.booking_services (...) select ...;
commit;
```

If the insert fails due to overlap, return a typed `SlotTakenError` and let the UI re-fetch availability. Never retry silently.

---

## 7. Booking flow (end-to-end)

1. **Discovery** (`/`, `/iskanje`, `/zemljevid`) — public. Server Components. Cache `revalidate: 300`.
2. **Salon page** (`/salon/[slug]`) — public. Shows services, staff, reviews. `revalidate: 60`.
3. **Service selection** — client component, persists to URL search params (`?services=s1,s3`) so deep-linking works.
4. **Date/time** — fetches availability via server action, streams in slots progressively. Polls Realtime for slot invalidation while the user lingers on the page.
5. **Auth gate** — if not logged in, prompt for phone (magic SMS via Supabase) or email. Persist intended booking in `sessionStorage` keyed by salon+services so they don't lose it.
6. **Confirm** — final summary, deposit (if required by salon), Stripe `PaymentIntent` with `capture_method=manual` for the deposit amount. The booking row is inserted only after `payment_intent.requires_capture` is confirmed (or skipped for no-deposit salons).
7. **Confirmation** — show success screen identical to `screens-2.jsx`. Trigger `notifications` insert for email confirmation + SMS reminder 24h before + SMS reminder 1h before.
8. **Lifecycle** — cron edge function (`supabase/functions/dispatch-notifications`) runs every minute, claims due rows with `for update skip locked`, sends via Resend/MessageBird, marks `sent_at`.

---

## 8. Authentication & authorization

- **Clients**: passwordless. Phone OTP (primary, market expectation in SI) + Apple/Google OAuth (secondary). Magic link email as fallback.
- **Partners**: email + password + 2FA (TOTP) required for `owner` role.
- **Admins**: invite-only, IP-allowlisted in Supabase, SAML if/when there are real employees.
- **Middleware** (`middleware.ts`): protect `/partner/*` and `/profil/*`. Use `@supabase/ssr` server client to read session; redirect unauthenticated users to `/prijava` preserving `?next=`.
- **Role checks** in server actions: never trust the client. Always re-derive role from `auth.uid()` against `profiles.role` and `business_members`.

---

## 9. Payments (Stripe, Slovenian context)

- **Stripe Connect** in Express account mode for salon payouts. Onboarding flow at `/partner/onboarding/stripe`.
- **Stripe Tax** enabled; service categories mapped to Slovenian reduced VAT (9.5% for haircare/beauty — verify against current FURS guidance per service category before launch).
- **Deposits**: Optional per service. When enabled, `PaymentIntent.create({ capture_method: 'manual' })` at booking; capture on no-show (within 7 days), void on completion.
- **Full prepayment**: option for premium-tier salons, settled to their Connect account minus platform fee.
- **Platform fee**: configurable per business (`businesses.platform_fee_bps`), default 800 (8%). Stored in basis points to avoid float drift.
- **Refunds**: cancellation policy per salon (`cancellation_window_hours`). Auto-refund deposit if cancelled within window; partial/no refund otherwise. Always surface the policy clearly during booking.
- **Webhook**: `/api/stripe/webhook` — verify signature, idempotency via `stripe_event_id` unique constraint on a `webhook_events` table. Handle `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`, `charge.refunded`.

---

## 10. Notifications & content

Templates (React Email, `packages/emails`):

- `booking_confirmed` (email + SMS digest)
- `booking_reminder_24h` (SMS only)
- `booking_reminder_1h` (SMS only)
- `booking_cancelled_by_client` (email to salon)
- `booking_cancelled_by_salon` (email + SMS to client, refund note)
- `review_request` (email, 2h after appointment end)
- `partner_new_booking` (email + SMS to salon)
- `partner_weekly_digest` (email, Mondays 08:00 Europe/Ljubljana)

All copy in Slovenian. English variants only after the EN locale is launched (Phase 4).

---

## 11. SEO, performance, accessibility

- **SEO**: every `/salon/[slug]` page renders `LocalBusiness` JSON-LD with `priceRange`, `geo`, `openingHoursSpecification`, `aggregateRating`. Sitemap from `businesses` table, `lastmod` from `updated_at`. `robots.ts` allows everything except `/partner/*` and `/profil/*`.
- **Performance budget**: Lighthouse mobile ≥ 95 on Performance, Accessibility, Best Practices, SEO. LCP < 1.5s on 4G. Total JS < 180KB on first load for the home page.
- **Images**: `next/image` exclusively, with `priority` only on the hero. Salon photos uploaded to Supabase Storage, transformed via `image/v1/render/sign` with WebP output.
- **Fonts**: `next/font/google` for Fraunces and Inter with `display: swap` and only the weights/styles actually used (audit the prototype: Fraunces 300–600 + italic, Inter 400/500/600/700).
- **Accessibility**: WCAG 2.2 AA. Run `eslint-plugin-jsx-a11y` and `@axe-core/playwright` in CI. Color contrast: the prototype's `textDim` on dark needs verification against `#0A0F0C` — the lighter `rgba(236,230,214,0.6)` passes, the dimmer `0.38` only does for non-essential decoration.
- **PWA**: web manifest + service worker (Serwist) for offline shell + install banner. No push notifications in v1 (SMS is preferred in SI).

---

## 12. Responsive strategy

Tailwind breakpoints used:

- `<640` (default, mobile) — single column, full-bleed cards, bottom tab bar, design parity with prototype
- `sm: 640+` (large phone)
- `md: 768+` (tablet) — two-column lists, side filter drawer
- `lg: 1024+` (desktop) — three-column lists, persistent left nav for partner dashboard, search results next to map
- `xl: 1280+` — content max-width 1240px, never wider

The consumer app stays "phone-shaped" on desktop: a centered column max-width 480px for the booking flow, with editorial breathing room either side. Discovery (home, search, map) expands to full width with multi-column grids. The partner dashboard is desktop-first because that's how salons use it; on mobile it collapses to a single column and the calendar becomes day-only.

---

## 13. Testing

- **Unit** (`vitest`): pure logic, especially `lib/availability.ts`. Aim for 100% line coverage on availability and price calculations. Property-based tests (`fast-check`) for slot generation to catch DST and overlap edge cases.
- **Integration**: server actions with a local Supabase via `supabase start`. Each test wraps a `begin/rollback` transaction.
- **E2E** (`playwright`): the booking happy path on mobile viewport (390×844), the cancellation flow, the partner accepts-a-booking flow. Run in CI on every PR.
- **Visual regression**: Chromatic on shadcn-based primitives. Re-snapshot on token changes.
- **Manual QA matrix** before launch: iOS Safari 17/18, Chrome Android 12, Firefox, Safari macOS. Test with Slovenian keyboard, real Slovenian addresses, real `+386` phone numbers, real EUR Stripe test cards.

---

## 14. Observability & operations

- **Sentry** (frontend + backend): release tagging per deploy, source maps uploaded in CI. Alert on error rate > 1% or any new issue in `booking.create`.
- **PostHog EU**: pageviews, funnel events (`booking_started`, `service_selected`, `slot_selected`, `booking_confirmed`), session replay sampled 10% (exclude `/partner/*` for partner privacy).
- **Vercel Analytics**: Web Vitals trend.
- **Status page**: `status.lepo.si` via UptimeRobot or BetterStack; monitor `/api/health` (verifies DB connectivity).
- **Logs**: Vercel runtime logs streamed to Better Stack or Axiom; redact PII (phone, email) at the source.
- **Database backups**: Supabase daily PITR (paid tier) — required before launch.

---

## 15. Security checklist (pre-launch)

- [ ] All tables have RLS enabled with explicit policies
- [ ] Service-role key never reaches the browser (`grep` build output)
- [ ] CSP header set (no `'unsafe-eval'` outside Stripe iframe)
- [ ] HSTS preloaded
- [ ] Rate limiting on `/api/*` and server actions (Upstash Ratelimit) — login 5/min, booking 10/min per IP+user
- [ ] Webhook signatures verified (Stripe, MessageBird)
- [ ] Open Redirect: validate `?next=` against an allowlist of internal paths
- [ ] SQL injection: only parameterized queries via Supabase JS / Postgres types; no string interpolation
- [ ] File upload: enforce content-type and size on Supabase Storage policies; scan images via `image-size` before storing
- [ ] Secrets: Vercel env vars, separate per environment, rotated quarterly
- [ ] Dependency audit: `pnpm audit` in CI, Dependabot weekly
- [ ] GDPR: privacy policy, ToS, cookie banner (consent for PostHog only — Sentry is legitimate interest), data export at `/profil/podatki`, deletion at `/profil/izbris`

---

## 16. Phased delivery plan (realistic)

Each phase ends with a deploy to a real preview URL and a stakeholder review. **No phase ships without all of its acceptance criteria.**

### Phase 0 — Foundations (3 days)

- Create monorepo, Next.js app, Tailwind, shadcn, ESLint, Prettier, TS strict, CI
- Connect Vercel + Supabase (EU project), set up env per environment
- Implement design tokens as Tailwind theme; port `IconSet`, `Avatar`, base primitives
- Deploy a "hello" route with the Splash visual to verify pipeline

**Acceptance:** preview URL renders the Splash screen pixel-matched on a real iPhone Safari.

### Phase 1 — Consumer marketplace, read-only (1.5 weeks)

- Migrations for `profiles`, `businesses`, `services`, `business_members`, `service_staff`, `weekly_hours`, `hours_exceptions`, `reviews`, `favorites`
- Seed 6 fictional Slovenian salons (use real Ljubljana neighborhoods: Center, Šiška, Bežigrad, Vič)
- Build `/`, `/iskanje`, `/zemljevid`, `/salon/[slug]` matching the prototype
- i18n setup with `sl` only
- `LocalBusiness` JSON-LD, sitemap, robots

**Acceptance:** Lighthouse mobile ≥ 95 on home and salon pages. Real users can browse seeded data on a phone.

### Phase 2 — Auth + Booking happy path (2 weeks)

- Supabase Auth: phone OTP + Google + Apple
- Migrations for `bookings`, `booking_services`, `notifications`
- `lib/availability.ts` with full test coverage
- `/rezervacija` flow: services → date/time → auth gate → confirm (no payment yet)
- `notifications` outbox + edge function dispatching emails (Resend) and SMS (MessageBird sandbox)
- `/profil`, `/profil/rezervacije`, cancellation within policy

**Acceptance:** A user can book a real seeded salon on their phone, receive a real confirmation email and SMS, and see it in `MyBookings`. No double-booking is possible under simulated concurrent load (k6 script committed in repo).

### Phase 3 — Partner dashboard MVP (2 weeks)

- Partner onboarding (`/partner/onboarding`)
- `/partner/koledar` — day/week view of bookings, drag-to-reschedule (with conflict validation)
- `/partner/storitve`, `/partner/ekipa`, `/partner/ure` (hours), `/partner/izjeme` (exceptions)
- Accept/decline pending bookings
- New-booking SMS to staff

**Acceptance:** A real partner can self-onboard a salon, configure hours, accept a booking, and reschedule it without engineer involvement.

### Phase 4 — Payments + Reviews + Polish (2 weeks)

- Stripe Connect onboarding, Stripe Tax for SI VAT
- Deposit flow on booking; refund logic on cancellation
- Reviews: post-booking email prompts, submission flow, display on salon pages
- English locale (`en`)
- PWA manifest + service worker

**Acceptance:** End-to-end booking with deposit completes. VAT-correct invoice PDF emailed. Reviews appear on salon pages and influence `aggregateRating`.

### Phase 5 — Pre-launch hardening (1 week)

- Run security checklist (§15) in full
- Load test (k6): 200 concurrent users browsing, 50 concurrent bookings
- Penetration test (engage an outside firm or use OWASP ZAP baseline)
- Privacy policy + ToS reviewed by a Slovenian lawyer
- Status page live, on-call rotation defined, runbook for top 5 failure modes
- Marketing site polish, OG images per salon

**Acceptance:** All security checklist items checked. No P0/P1 issues open. Stakeholder sign-off.

### Phase 6 — Launch

- DNS cutover (`lepo.si`)
- Open registration to public
- Monitor Sentry/PostHog/Vercel dashboards for the first 72 hours with eyes on screen

---

## 17. Anti-patterns to refuse explicitly

If asked to do any of the following during implementation, push back and reference this section:

- **"Just use Firebase / MongoDB / Prisma without RLS"** — multi-tenant marketplace without DB-level row security is a breach waiting to happen.
- **"Skip TypeScript to move faster"** — type generation from Supabase is the contract that prevents the most common booking-app bugs.
- **"Use server-side polling for slot availability"** — Realtime exists for this; polling at scale will throttle Postgres connections.
- **"Compute availability in the client"** — duration math in JS will drift from server truth and produce ghost slots.
- **"Store local time strings"** — DST will eat a booking eventually. `timestamptz` always.
- **"Email-only booking confirmations"** — Slovenian customers expect SMS; email-only will cause no-shows.
- **"Skip the EXCLUDE constraint, we check overlap in code"** — double-booking under concurrency is a reputation-destroying class of bug; the DB-level constraint is non-negotiable.
- **"Use any UI kit (Material UI, Ant Design, Chakra)"** — the design language is bespoke; generic kits will fight the gold/Fraunces aesthetic.
- **"Single 'admin' login for the salon owner"** — every staff member needs their own account for calendar and audit trail.
- **"Launch without a privacy policy / GDPR data export"** — illegal in SI; will draw regulator attention quickly.

---

## 18. Definition of done (for the whole product)

A user in Ljubljana, on iOS Safari, holding a real iPhone:

1. Lands on `lepo.si` from a Google search for a salon in Center
2. Browses the salon's page with services and reviews
3. Selects two services, picks a time the day after tomorrow, signs in with their phone number, books, and pays a deposit
4. Receives a Slovenian SMS confirmation within 10 seconds
5. Receives a reminder SMS 24h before the appointment
6. Shows up; the salon owner checks them in on `/partner/koledar` from an iPad
7. Two hours later, the user gets a review-request email in Slovenian
8. Leaves 5 stars; the review is visible on the salon's page within 60 seconds
9. The salon owner sees the payment landed in their Stripe Express dashboard the next business day

Every step works without an engineer's intervention, without console errors, and without a Sentry alert firing. **That is "production".**

---

## 19. How to use this document with an AI coding agent

When tasking Claude (or another agent) with implementation work:

1. Place this file and `CLAUDE.md` at the repo root. Both will be loaded automatically by Claude Code.
2. For each phase from §16, open a focused session: "We are starting Phase 2. Read `PRODUCTION_PROMPT.md` §6, §7, §8. Implement migration `XXXX_bookings.sql` matching the schema in §5. Then implement `lib/availability.ts` per §6 with the test cases listed below."
3. Provide phase acceptance criteria as the verification step.
4. Do not let the agent invent its own stack or schema decisions — point it back to the relevant section.
5. Require a passing CI run and a working preview URL before merging anything.

This is a real product. Treat the spec as the contract.
