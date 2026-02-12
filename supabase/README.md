# Supabase – push SQL to your project

You can apply all migrations to your hosted Supabase project from the CLI (no copy‑paste in the SQL Editor).

## One-time setup

1. **Install Supabase CLI** (if needed):
   ```bash
   npm install -g supabase
   # or: brew install supabase/tap/supabase
   ```

2. **Log in** (opens browser or use token):
   ```bash
   npx supabase login
   ```
   Token: [Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)

3. **Link this repo to your project** (use your project ref, e.g. `bwyjitcjuysaykcophyt`):
   ```bash
   npx supabase link --project-ref bwyjitcjuysaykcophyt
   ```
   Enter your **database password** when prompted (Project Settings → Database).

## Push migrations

From the **project root**:

```bash
npx supabase db push --linked
```

This applies, in order:

- `20250212100000_initial_schema.sql` – base `public.skills` table and RLS
- `20250212120000_extended_schema.sql` – categories, tags, users, votes, comments, collections, and extra skill columns

Already-applied migrations are skipped. To see what would run without applying:

```bash
npx supabase db push --linked --dry-run
```

To list migration status (local vs remote):

```bash
npx supabase migration list --linked
```

## If you already ran `schema.sql` in the dashboard

That’s fine. The first migration uses `CREATE TABLE IF NOT EXISTS` and `DROP POLICY IF EXISTS`, so it won’t break. Run `npx supabase db push --linked` to apply only the extended schema (and any future migrations).
