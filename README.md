# Lepo — Atelier Slovenija

Premium beauty & barber booking marketplace for Slovenia.

> The product spec lives in [PRODUCTION_PROMPT.md](./PRODUCTION_PROMPT.md). The working notes for Claude live in [CLAUDE.md](./CLAUDE.md). Read both before contributing.

## Requirements

- Node `>=22` (see `.nvmrc`)
- pnpm `>=10` (enforced via `packageManager` in `package.json`)
- Supabase CLI (`brew install supabase/tap/supabase`)
- A `.env.local` in `apps/web` based on `apps/web/.env.example`

## Quick start

```bash
pnpm install
pnpm dev          # Next.js dev server on http://localhost:3000
```

## Common scripts

```bash
pnpm dev          # Start the consumer/partner web app in dev mode
pnpm build        # Production build
pnpm typecheck    # tsc --noEmit across all workspaces
pnpm lint         # ESLint across all workspaces
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright end-to-end
pnpm format       # Prettier write
```

## Layout

```
lepo/
├── apps/
│   └── web/              # Next.js 15 — both consumer and partner surfaces
├── packages/
│   ├── emails/           # React Email templates (Slovenian-first)
│   └── config/           # Shared ESLint / TS / Tailwind config
├── supabase/
│   ├── migrations/       # Versioned SQL — applied via `supabase db push`
│   ├── functions/        # Edge functions (notification dispatch, cron)
│   └── seed.sql          # Seed data: holidays, demo salons
└── .github/workflows/    # CI: lint, typecheck, test, build, preview deploy
```
