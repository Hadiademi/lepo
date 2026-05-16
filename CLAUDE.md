# Lepo — Atelier Slovenija

A booking marketplace for premium beauty/barber salons in Slovenia. UI is in Slovenian. Currently a high-fidelity React prototype; being rebuilt into a production Next.js application.

---

## Current state of this directory

This directory contains the **design prototype**, not the production app. The prototype is a single-page React application loaded via UMD/Babel-standalone in the browser — there is no build step, no package.json, no backend.

```
index.html            # Entry: loads React UMD + Babel standalone + all .jsx files
app.jsx               # Root component, navigation stack, tab bar, tweaks panel
tokens.jsx            # Design tokens (colors, typography, premium gold treatment)
components.jsx        # Shared primitives (Icon, Avatar, etc.)
screens-1.jsx         # Splash, Onboarding, Home, Search, BarberProfile
screens-2.jsx         # Booking step 1, step 2, Confirmation, MyBookings, MapView
ios-frame.jsx         # iPhone chrome (status bar, notch)
tweaks-panel.jsx      # Live theme tweaker (right-side panel)
```

**The prototype is the source of truth for design**, not implementation. Visual decisions (palette, typography, spacing, animation timing, copy) should be preserved exactly when porting to the production codebase. Implementation patterns (inline styles, UMD React, single navigation stack in `useState`) will not survive the port.

To preview the prototype locally:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

---

## Target production stack

When work moves to the production app, the stack is **fixed** (chosen deliberately — do not substitute without explicit user approval):

| Layer     | Choice                                         | Why                                                                         |
| --------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| Framework | **Next.js 15 (App Router)**                    | SSR + SEO for marketplace discovery, edge runtime, image optimization       |
| Language  | **TypeScript (strict)**                        | Type-safety end-to-end, including DB types from Supabase                    |
| Styling   | **Tailwind CSS v4** + **shadcn/ui**            | Mobile-first utilities; accessible Radix primitives                         |
| Animation | **Framer Motion**                              | Replicates the prototype's slide transitions                                |
| State     | **Zustand** (UI) + **TanStack Query** (server) | Avoid Redux; React Context only for theme                                   |
| Forms     | **React Hook Form** + **Zod**                  | Schema validation shared with API routes                                    |
| i18n      | **next-intl**                                  | Slovenian primary; English secondary                                        |
| Database  | **Supabase (Postgres)**                        | EU-hosted (Frankfurt), RLS for multi-tenant, Realtime for slot availability |
| Auth      | **Supabase Auth**                              | Email + Google + Apple; magic links for clients                             |
| Storage   | **Supabase Storage**                           | Salon/staff photos, transformed via Next/Image                              |
| Payments  | **Stripe** (with Slovenian VAT)                | Card + deposit-on-booking to reduce no-shows                                |
| Email     | **Resend** + **React Email**                   | Templated transactional mail in Slovenian                                   |
| SMS       | **MessageBird** (or Twilio)                    | Booking reminders — critical for Slovenian market                           |
| Analytics | **PostHog** (EU cloud)                         | Product analytics + feature flags + session replay                          |
| Errors    | **Sentry**                                     | Frontend + backend error tracking with source maps                          |
| Hosting   | **Vercel**                                     | Edge network, preview deployments per PR                                    |
| Domain    | TBD (`.si` recommended)                        | Slovenian TLD increases trust                                               |

**Forbidden substitutions without discussion:** Firebase, MongoDB, Express, plain CSS modules, Redux, Auth0, Mailchimp.

---

## Design system (extract from prototype, preserve in production)

### Palette

- Background dark: `#0A0F0C` (primary), elevated `#131A16`
- Background light: `#E5E2D2` (primary), elevated `#F6F3E8`
- Accent gold: `#C28F5C` (primary CTA, premium treatment)
- Accent sage: `#7A9885` (secondary, success states)
- Text on dark: `#ECE6D6` (primary), `rgba(236,230,214,0.6)` (dim)
- Text on light: `#1A2420` (primary)
- Premium gold gradient: `linear-gradient(168deg, #D2A472 0%, #C28F5C 48%, #8E6238 100%)`

### Typography

- **Display:** Fraunces (serif, italic for accent characters — note the `Lep<em>o</em>` lockup)
- **Body:** Inter
- Display tracking: `-0.03em` to `-0.045em` (tight)
- Body tracking: `-0.01em` to `0.02em`

### Motion

- Page transitions: 280ms `cubic-bezier(0.4, 0, 0.2, 1)` slide
- Hover/press: 200ms ease
- Pulse loaders: 1.4s ease-in-out infinite

### Voice (Slovenian)

- Formal-warm: "Rezerviraj termin za lepoto"
- Premium positioning: "Atelier · Slovenija", "vrhunski saloni"
- Concise CTAs: "Rezerviraj", "Naprej", "Potrdi"

---

## Domain knowledge — booking marketplaces are not generic CRUD

Patterns that will bite if ignored:

1. **Availability is a computed view**, not a stored table. Slots are derived from `business_hours - booked_intervals - blocked_intervals` at query time. Caching it eagerly causes stale-slot bugs.
2. **Timezones**: Slovenia is `Europe/Ljubljana` (CET/CEST). Store all timestamps as `timestamptz` UTC; convert at the edge. Never store local time.
3. **Double-booking prevention**: enforce via Postgres `EXCLUDE USING gist` constraint with `tstzrange`, not application logic. Application checks are racy.
4. **No-shows**: deposit (Stripe `payment_intent` with `capture_method=manual`) authorized at booking, captured on no-show. Common in EU beauty industry.
5. **Service duration ≠ slot duration**: a 45-min haircut may need a 15-min cleanup buffer. Model `duration` and `buffer_after` separately.
6. **Recurring availability with exceptions**: business hours per weekday + override table for holidays/vacations. Slovenian public holidays must be seeded.
7. **GDPR**: explicit consent for marketing emails, data export endpoint, deletion endpoint. Supabase Auth handles some but not all of this.
8. **VAT**: Slovenian VAT is 22% standard, 9.5% for hairdressing services (reduced rate, verify with current regulations). Invoicing must show VAT breakdown.

---

## Conventions for the production codebase

When implementation moves to the Next.js project, follow:

- **No inline styles.** Tailwind utilities only. Extract repeated patterns to components, not `@apply`.
- **Server Components by default.** Add `"use client"` only when you need state, effects, or browser APIs.
- **Co-locate** queries with the components that use them; use `React.cache` / Next's `cache` for request deduplication.
- **Supabase access:**
  - Client side → `@supabase/ssr` with anon key, RLS-protected
  - Server side → service role only in server actions / route handlers, never exposed to client
- **Never** trust client-supplied user IDs. Always derive from `auth.uid()` server-side.
- **Migrations:** `supabase/migrations/*.sql`, applied via `supabase db push` in CI. Never edit applied migrations.
- **Errors:** throw typed errors in server actions, return `Result<T, E>` in client code. Surface to user via toast (sonner) + Sentry breadcrumb.
- **Naming:** PascalCase components, kebab-case files, camelCase functions, SNAKE_CASE env vars, `snake_case` DB columns.

---

## Commands (production project, once created)

```bash
pnpm dev                          # Next dev server with Turbopack
pnpm build && pnpm start          # Production build + run
pnpm typecheck                    # tsc --noEmit
pnpm lint                         # ESLint + Prettier check
pnpm test                         # Vitest
pnpm test:e2e                     # Playwright
pnpm db:types                     # Regenerate Supabase types
supabase db push                  # Apply migrations to linked project
supabase functions deploy <name>  # Deploy edge function
```

---

## Working notes for Claude

- The user (Hadi) prefers concise, decisive recommendations — not "you could consider..." menus. Pick one, explain why, name the trade-off.
- The user communicates in Albanian; respond in Albanian unless the artifact (code, docs, commit messages) is better in English. Technical files in English; conversational replies in Albanian.
- This is a real production product, not a learning exercise. Suggest patterns used by shipped products, not tutorial code.
- When porting a screen from the prototype, the visual output must match pixel-for-pixel on mobile (390×844). Desktop layout is additive, not a redesign.
- If a request would compromise the design (e.g. "use Material UI" or "drop the gold treatment"), push back and explain why before complying.
