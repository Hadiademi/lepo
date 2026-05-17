# Lepo — Progress Tracker

Mapped to `PRODUCTION_PROMPT.md` §16. Update at the end of every implementation session. Three docs work together:

| Doc | Purpose |
|---|---|
| `CLAUDE.md` | Project conventions, design tokens, working notes for AI |
| `PRODUCTION_PROMPT.md` | Canonical spec — schema, security, anti-patterns, phased plan |
| `PROGRESS.md` *(this file)* | What is shipped vs. pending. Source of truth for status. |

---

## Snapshot

- **Today**: 2026-05-17
- **Current phase**: Phase 2 — Auth + Booking
- **Current focus**: Build `lib/availability.ts` (slot computation engine)
- **Live preview**: dev `http://localhost:3002` · prod TBD
- **Latest commit on main**: `417ae1a feat(db): phase 2 bookings schema with anti-overlap constraint`

Legend: ✅ shipped · 🟡 in progress · ⬜ not started · ⏭ deferred (decision needed before resuming)

---

## Phase 0 — Foundations ✅ DONE (2026-05-16)

- [x] pnpm workspace monorepo (`apps/web`, `packages/config`, `packages/emails`)
- [x] Next.js 16 (App Router) + TypeScript strict + Tailwind v4
- [x] ESLint + Prettier + Vitest + Playwright + axe-core
- [x] GitHub Actions CI matrix (lint / typecheck / test / e2e)
- [x] Supabase project `lepo-dev` (eu-central-1 Frankfurt, Postgres 17)
- [x] GitHub repo `Hadiademi/lepo`
- [x] Design tokens ported into `globals.css` (forest noir / linen / brushed copper / sage)
- [x] `next/font` for Fraunces (display) + Inter (body)
- [x] Splash screen pixel-matched to prototype

**Acceptance:** preview URL renders splash pixel-matched on mobile. ✅

---

## Phase 1 — Consumer marketplace, read-only ✅ DONE (2026-05-17)

### Schema + data
- [x] Migration: `profiles`, `businesses`, `business_members`, `services`, `service_staff`, `weekly_hours`, `hours_exceptions`, `reviews`, `favorites`
- [x] PostGIS extension in `extensions` schema (for `geography(point, 4326)`)
- [x] RLS enabled on every table with public-read policies for the published consumer surface
- [x] `handle_new_user` trigger auto-creating profile rows from `auth.users`
- [x] EXECUTE on `handle_new_user` revoked from anon/authenticated (advisor warning fixed)
- [x] GRANT/REVOKE rebalanced (auto-expose disabled at project creation → opt-in per table)
- [x] Seed: 6 Ljubljana salons (Center × 2, Šiška × 2, Bežigrad × 1, Vič × 1), 17 staff, 27 services, 36 weekly hours, 21 reviews
- [x] TypeScript types generated into `apps/web/src/lib/supabase/types.ts`
- [x] Supabase browser + server clients via `@supabase/ssr`

### Pages
- [x] Home `/` — mobile prototype-parity (greeting, search, category pills, TOP scroll, v-bližini list, bottom tab bar) + desktop dated-issue catalog (top nav, masthead, search-forward band, wider grid)
- [x] Salon detail `/salon/[slug]` — hero (desktop overlay / mobile card), four issue-numbered sections (Opis · Storitve · Ekipa · Ocene), sticky CTA on mobile, sidebar with hours + contact + booking CTA on desktop
- [x] `HealthAndBeautyBusiness` JSON-LD with `AggregateRating` + `OpeningHoursSpecification` + `PostalAddress`

### Deferred to later phases (not blocking Phase 1 acceptance)
- [ ] `/iskanje` (search) page — pushed to Phase 2 polish
- [ ] `/zemljevid` (map) page — needs **Mapbox vs Leaflet** decision before starting
- [ ] `next-intl` wiring (sl only) — strings currently inline
- [ ] `sitemap.ts` + `robots.ts` — needed before public launch
- [ ] Lighthouse mobile ≥95 verified — needs a real preview deploy

**Acceptance:** real users can browse seeded data on phone + desktop. Lighthouse run pending. ✅ functionally complete.

---

## Phase 2 — Auth + Booking happy path 🟡 IN PROGRESS

### Schema ✅ (commit `417ae1a`)
- [x] `bookings` table with `tstzrange time_range`, status enum, total/deposit cents, Stripe PI ref, cancellation fields
- [x] **`bookings_no_overlap` EXCLUDE constraint** verified live: `EXCLUDE USING gist (staff_user_id WITH =, time_range WITH &&) WHERE status IN ('pending','confirmed')`
- [x] `booking_services` (snapshot price + duration + VAT)
- [x] `notifications` outbox (channel + template + payload + send_after + sent_at + attempts)
- [x] `reviews.booking_id` FK added (nullable so Phase 1 seeded reviews survive; partial unique index on the non-null subset)
- [x] btree_gist extension
- [x] RLS on the three new tables
- [x] GRANTs: revoke default SELECT on anon (private booking data), explicit grants for service_role + authenticated
- [x] TypeScript types regenerated

### Implementation — to ship next
- [ ] **`apps/web/src/lib/availability.ts`** — pure slot computation. Inputs: businessId, serviceIds, staffUserId?, dateRange, clientTimezone. Output: list of `{ startsAt, endsAt, staffUserId }` slots in 15-min steps, after subtracting overlapping bookings and applying hours_exceptions overrides.
- [ ] Unit tests `availability.test.ts` (vitest). 100% line coverage target. Cover: simple range, buffer_after, multi-service sum, existing booking overlap, closed weekday, hours_exceptions replacing weekly hours, **DST spring-forward** (last Sunday of March in Europe/Ljubljana — 02:00–03:00 disappears), **DST fall-back** duplication.
- [ ] `/rezervacija/[slug]/page.tsx` — step 1 *Izberi storitev* (multi-checkbox + running total/duration footer)
- [ ] `/rezervacija/[slug]/page.tsx` — step 2 *Datum in čas* (day picker horizontal scroll + slot grid with Prosto/Zasedeno legend, prototype-parity)
- [ ] `/rezervacija/[slug]/potrjeno` — confirmation screen (success check icon + summary card + Dodaj v koledar / Pokaži na zemljevidu CTAs)
- [ ] State carried via URL search params (`?services=s1,s3&date=2026-05-20&time=15:30`) for deep-linking + back/forward
- [ ] Server action `createBooking()` — atomic transaction: insert booking + insert booking_services. On 23P01 (exclusion violation) → return typed `SlotTakenError`. Never retry silently. `client_user_id` from `auth.uid()`.
- [ ] `/profil` + `/profil/rezervacije` (my bookings + cancellation within policy)

### Auth ⏭ DECISION NEEDED before resuming
Two paths — Hadi to choose:

- **(A) Defer auth** — use hardcoded demo `client_user_id` for dev bookings, ship the UI flow now, real auth later. **Faster, ships visible end-to-end faster.**
- **(B) Real auth now** — Supabase phone OTP + Google + Apple per §8. Real bookings tied to real users. **More complete, slower.**

Recommended: **(A)** for one session, **(B)** in a follow-up.

- [ ] Supabase Auth UI (phone OTP / Google / Apple)
- [ ] Middleware refreshing session cookies
- [ ] Magic-link email fallback

### Notifications outbox
- [ ] `supabase/functions/dispatch-notifications` edge function (cron-every-minute, `for update skip locked`)
- [ ] Resend API key + sender domain (`no-reply@lepo.si`)
- [ ] MessageBird sandbox originator (`Lepo`)
- [ ] Templates `booking_confirmed`, `booking_reminder_24h`, `booking_reminder_1h`, `booking_cancelled_*`

**Acceptance:** user books a real seeded salon end-to-end on their phone, receives Slovenian SMS + email, sees it in `/profil/rezervacije`, no double-booking possible under k6 load.

---

## Phase 3 — Partner dashboard MVP ⬜ TODO

- [ ] Partner onboarding wizard `/partner/onboarding`
- [ ] `/partner/koledar` — day / week calendar with drag-to-reschedule + conflict validation
- [ ] `/partner/storitve` — services CRUD with active/inactive toggle
- [ ] `/partner/ekipa` — staff management (invite link, role assignment)
- [ ] `/partner/ure` — weekly_hours editor per staff
- [ ] `/partner/izjeme` — hours_exceptions editor for holidays/vacation
- [ ] Accept / decline pending bookings
- [ ] New-booking SMS to assigned staff
- [ ] Partner write RLS policies (deferred from Phase 1)
- [ ] 2FA (TOTP) required for `owner` role

**Acceptance:** a real partner self-onboards a salon, configures hours, accepts a booking, reschedules it — no engineer involvement.

---

## Phase 4 — Payments + Reviews + Polish ⬜ TODO

- [ ] Stripe Connect Express onboarding
- [ ] Stripe Tax for Slovenian VAT (9.5% reduced rate, verify per service category)
- [ ] Deposit flow: `payment_intent.create({ capture_method: 'manual' })` at booking; capture on no-show (within 7 days), void on completion
- [ ] Full prepayment option for premium-tier salons
- [ ] Platform fee per business (`platform_fee_bps`, default 800 = 8%)
- [ ] Refunds based on per-salon `cancellation_window_hours`
- [ ] Stripe webhook `/api/stripe/webhook` with signature verification + idempotency table
- [ ] Reviews submission flow (2h-after-appointment email prompt)
- [ ] PWA manifest + service worker (Serwist) + install banner
- [ ] English locale (`en`) added to next-intl

**Acceptance:** end-to-end booking with deposit completes, VAT-correct invoice emailed, reviews appear on salon pages.

---

## Phase 5 — Pre-launch hardening ⬜ TODO

- [ ] Full §15 security checklist
- [ ] Rate limiting via Upstash Ratelimit (login 5/min, booking 10/min per IP+user)
- [ ] CSP header (no `'unsafe-eval'` outside Stripe iframe)
- [ ] HSTS preloaded
- [ ] Open-redirect validation for `?next=`
- [ ] File upload content-type + size enforced on Supabase Storage
- [ ] Secrets rotation policy (Vercel env, quarterly)
- [ ] `pnpm audit` in CI + Dependabot weekly
- [ ] Load test: k6 — 200 concurrent users browsing, 50 concurrent bookings
- [ ] Penetration test (outside firm OR OWASP ZAP baseline minimum)
- [ ] Privacy policy + ToS reviewed by Slovenian lawyer
- [ ] GDPR data export at `/profil/podatki`
- [ ] GDPR deletion endpoint at `/profil/izbris`
- [ ] Cookie banner (consent only for PostHog)
- [ ] Status page `status.lepo.si` (UptimeRobot or BetterStack)
- [ ] On-call rotation defined + runbook for top 5 failure modes
- [ ] Supabase Pro tier upgrade for PITR backups

**Acceptance:** zero P0/P1 issues, stakeholder sign-off.

---

## Phase 6 — Launch ⬜ TODO

- [ ] Domain `lepo.si` purchased + DNS cutover
- [ ] Open public registration
- [ ] 72-hour eyes-on-screen monitor (Sentry / PostHog / Vercel)

---

## Cross-cutting trackers

### Observability (§14)
- [ ] Sentry frontend + backend (release tagging + source maps)
- [ ] PostHog EU (funnel events + session replay sampled 10% excluding `/partner/*`)
- [ ] Vercel Analytics (Web Vitals)
- [ ] Log redaction for PII (phone, email) at source
- [ ] `/api/health` endpoint with DB connectivity check

### Testing (§13)
- [x] Vitest + Playwright + axe-core configured (Phase 0)
- [x] `cn.test.ts` placeholder
- [ ] `lib/availability.test.ts` 100% coverage — Phase 2 priority
- [ ] Integration tests with local Supabase (`supabase start`) wrapping `begin/rollback`
- [ ] E2E booking happy path (`playwright`, mobile viewport 390×844)
- [ ] E2E partner accepts-booking flow
- [ ] Visual regression on shadcn primitives (Chromatic)

### Open decisions
- ⏭ Map library: **Mapbox** (paid, gorgeous) vs **Leaflet** (free, open) for `/zemljevid`
- ⏭ Phase 2 auth path: defer (A) vs ship now (B) — see Phase 2 section
- ⏭ Deploy: when to wire Vercel + Supabase GitHub integrations

### Stale / known issues
- Push currently uses inline-token URL because macOS keychain has a different user cached. Long-term fix: `gh auth login`.
- `service_staff` table is empty in seed. Availability engine for Phase 2 will treat every business member as a candidate for every service. Real per-service staff filtering is a Phase 3 refinement.
- `auth_leaked_password_protection` advisor warning will resolve once we enable the toggle in Supabase Studio (during Phase 2 auth).

---

## How to update this file

After every implementation session, do one of:

1. **Mark items shipped** — flip `[ ]` to `[x]`, add commit SHA when relevant.
2. **Add discovered work** — slot new items in the right phase or under "Cross-cutting trackers".
3. **Record decisions** — when an ⏭ decision is made, move it inline and strike the deferred marker.
4. **Update the snapshot block** at top with today's date + current focus.

Keep entries terse. Prose belongs in PR descriptions; this file is a glanceable status board.
