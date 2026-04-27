# AGENTS.md

## Cursor Cloud specific instructions

### Overview

TaskFlow is a Next.js 16 project management SaaS (single app, no monorepo). Tech stack: Next.js 16 + Turbopack, React 19, Tailwind CSS v4, Shadcn UI, PostgreSQL, pnpm.

### Local database setup

A local PostgreSQL 16 instance is used in place of Neon's serverless PostgreSQL. The database is pre-seeded with mock `neon_auth` schema tables, a sample organization, user, project, and tasks. RLS is disabled locally.

- **Start PostgreSQL** (if not running): `sudo pg_ctlcluster 16 main start`
- **Connection**: `postgresql://taskflow:taskflow@localhost:5432/taskflow`
- **Schema**: `scripts/01-create-schema.sql` (requires `neon_auth` schema tables created first)

### Auth stub

The `@stack-auth/nextjs` package does not exist on npm. A local stub at `stubs/stack-auth-nextjs/` provides mock `currentUser()` and `useUser()` functions that return a hardcoded dev user (UUID `00000000-0000-0000-0000-000000000002`, org `00000000-0000-0000-0000-000000000001`). The stub uses `react-server` conditional exports to properly separate server/client code.

### DB module (`lib/db.ts`)

Exports two database interfaces:
- `sql(query, params)` — function-call style, returns `rows` array (used by `lib/queries.ts`)
- `db` — `pg.Pool` instance with `db.query()` (used by API routes under `app/api/`)

Both use the local PostgreSQL via the `pg` package. The original `@neondatabase/serverless` neon driver is not used locally.

### Common commands

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` (port 3000) |
| Lint | `pnpm lint` |
| Build | `pnpm build` |
| Production | `pnpm start` |

### Gotchas

- The `@neondatabase/serverless` package is listed in `package.json` but not used at runtime locally. The `lib/db.ts` module wraps everything through `pg.Pool`.
- Some API routes (activity, analytics, members, attachments) import `{ db }` from `@/lib/db` and use `db.query()`. Other code (in `lib/queries.ts`) imports `{ sql }` and calls `sql()` as a function. Both patterns are supported.
- The ESLint config (`eslint.config.mjs`) uses `@eslint/js` with basic recommended rules. It doesn't include the full `next/core-web-vitals` config due to ESLint 9 compatibility issues.
- `next.config.mjs` has `typescript: { ignoreBuildErrors: true }`, so TypeScript errors won't block builds.
- There is no root page (`app/page.tsx`). The app entry point is `/dashboard`.
