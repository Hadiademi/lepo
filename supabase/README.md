# Supabase

This directory is the source of truth for the Lepo database schema, RLS policies, edge functions, and seed data.

## Local development

```bash
# Install the CLI once (Homebrew on macOS)
brew install supabase/tap/supabase

# Start a local Supabase stack (Postgres + Auth + Storage + Studio)
supabase start

# Apply all migrations to the local DB
supabase db reset
```

Studio UI: <http://localhost:54323>
Local API: <http://localhost:54321>
Email inbox (Inbucket): <http://localhost:54324>

## Migrations

```bash
# Create a new migration from current schema diff
supabase db diff --schema public -f <name>

# Or write SQL directly under migrations/ with a YYYYMMDDHHMMSS_<slug>.sql filename.
```

**Rules:**

- Never edit a migration after it has been applied to staging/production. Add a new one.
- Always include the inverse / cleanup in the same PR if the change is reversible.
- Every new table must have `enable row level security` and at least one policy in the same migration.

## Production

```bash
supabase link --project-ref <ref>
supabase db push          # apply pending migrations
supabase functions deploy <name>
```

Migrations are also applied automatically in CI on merge to `main` (see `.github/workflows/db-deploy.yml`, added in Phase 2).
