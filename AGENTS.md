# AGENTS.md

## Cursor Cloud specific instructions

### Overview

TaskFlow is a Next.js 16 (App Router) project management SaaS. Tech stack: TypeScript, Tailwind CSS v4, shadcn/ui, Neon PostgreSQL, Stack Auth, Vercel Blob. See `README.md` for full details.

### Dev commands

| Action | Command |
|--------|---------|
| Dev server | `pnpm dev` (port 3000) |
| Lint | `pnpm lint` |
| Build | `pnpm build` |

### Key gotchas

- **`@stack-auth/nextjs` is not on npm.** A local stub lives at `stubs/stack-auth-nextjs/` providing mock `useUser()` and `currentUser()` exports. This allows the app to compile and run without real Stack Auth credentials.
- **`@neondatabase/serverless` was missing from `package.json`** but is imported in `lib/db.ts`. It's now installed as a dependency.
- **ESLint was not installed** despite the `pnpm lint` script using it. ESLint 9 + `eslint-config-next` are now in devDependencies with a flat config at `eslint.config.mjs`.
- **Pre-existing lint errors** exist in the codebase (e.g., unescaped entities, parsing errors in `components/file-uploader.tsx`, impure function in `components/ui/sidebar.tsx`).
- **`pnpm build` fails** due to 4 API routes (`activity`, `analytics`, `members`, `attachments`) importing `{ db }` from `@/lib/db` when the actual export is `{ sql }`. This is a pre-existing code bug. The `next.config.mjs` has `ignoreBuildErrors: true` for TypeScript but Turbopack still catches module resolution errors.
- **Database query syntax mismatch:** `lib/queries.ts` calls `sql('SELECT ...', [params])` but `@neondatabase/serverless` v1.x requires tagged-template syntax (`sql\`SELECT ...\``) or `sql.query('SELECT ...', [params])`.

### External services required for full functionality

All pages under `/dashboard` require these services to work at runtime:

| Service | Env var(s) | Purpose |
|---------|-----------|---------|
| Neon PostgreSQL | `DATABASE_URL` | Database for all project/task data |
| Stack Auth | `STACK_PROJECT_ID`, `STACK_PUBLISHED_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY` | Authentication |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` | File attachment storage |

Without these credentials, the dev server starts and compiles pages but runtime DB queries will fail with expected errors. A `.env.local` with placeholder values is sufficient for the dev server to start.

### Project structure

- No root `app/page.tsx` exists — visiting `/` returns a 404
- All functional pages are under `app/dashboard/`
- API routes are under `app/api/`
- Database schema is in `scripts/01-create-schema.sql`
