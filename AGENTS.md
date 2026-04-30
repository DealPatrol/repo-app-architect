# AGENTS.md

## Cursor Cloud specific instructions

### Overview

CodeVault is an AI-powered code intelligence platform built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS v4**, and **Shadcn UI**. It connects to GitHub repos, scans files, and uses AI to discover application blueprints.

### Package manager

This project uses **pnpm**. The lockfile is `pnpm-lock.yaml`.

### Scripts (from `package.json`)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Next.js dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm exec tsc --noEmit` | Type check |

### Lint and type check

- **Lint**: `pnpm lint` — runs ESLint. The codebase has a few pre-existing lint warnings/errors (unused vars, `prefer-const`, `set-state-in-effect`). These are not regressions.
- **Type check**: `pnpm exec tsc --noEmit` — clean pass. If you see errors referencing `.next/types/validator.ts` or `.next/dev/types/validator.ts`, run `rm -rf .next` first, as stale generated types can cause false failures.

### No automated test suite

There is no test framework (jest, vitest, playwright, etc.) configured in this codebase. CI only runs lint + typecheck.

### Database

The app uses `@neondatabase/serverless` (Neon's HTTP-based serverless PostgreSQL driver). This driver communicates via HTTP fetch, **not** a standard PostgreSQL socket connection. For local development you have two options:

1. **Use a real Neon database** (recommended): Set `DATABASE_URL` to a Neon connection string. The schema migration is at `scripts/01-create-schema.sql`, or hit `GET /api/setup/init-db` to initialize the DB via the app.
2. **Use local PostgreSQL with neon-http-proxy**: Run `ghcr.io/timowilhelm/local-neon-http-proxy` Docker container and configure `neonConfig.fetchEndpoint` in the app to point to it. This requires more setup (see the GitHub issue at neondatabase/serverless#33).

### Environment variables

Copy `.env.example` to `.env.local`. Required variables:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth App credentials
- `NEXT_PUBLIC_APP_URL` — App URL (use the local dev server URL)
- `OPENAI_API_KEY` — For AI analysis features
- `ANTHROPIC_API_KEY` — Optional, for scaffold generation

### Authentication

The app uses GitHub OAuth. The middleware at `middleware.ts` blocks unauthenticated access to `/dashboard/*` routes by checking `github_user_id` and `github_access_token` cookies. To test dashboard features, you need a working GitHub OAuth App with the callback URL set to `{NEXT_PUBLIC_APP_URL}/api/auth/github/callback`.

### Key gotchas

- The landing page (`/`) works without any database or API credentials — it's a static page.
- All dashboard routes require authentication cookies set by the GitHub OAuth flow.
- The `@neondatabase/serverless` driver's `neon()` function uses HTTP fetch (not TCP sockets), so standard `pg` connection strings to local PostgreSQL won't work directly — you need either a Neon database or the HTTP proxy.
- The pnpm install may warn about ignored build scripts for `sharp` and `unrs-resolver`. This is fine and doesn't affect functionality.
