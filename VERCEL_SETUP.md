# CodeVault - Vercel Deployment Setup

## Option A: Vercel Native Integration (Simplest)

Connect your GitHub repo directly in the Vercel dashboard. No GitHub Actions needed.

### 1. Set Environment Variables on Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add all of these:

| Variable | Environment | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Production, Preview, Development | Supabase PostgreSQL connection string |
| `GITHUB_CLIENT_ID` | Production, Preview, Development | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Production, Preview, Development | GitHub OAuth App client secret |
| `NEXT_PUBLIC_APP_URL` | Production | Your production URL (e.g. `https://codevault.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Preview | Leave blank — Vercel sets this automatically for previews |
| `OPENAI_API_KEY` | Production, Preview | OpenAI API key for AI analysis |
| `ANTHROPIC_API_KEY` | Production, Preview | Anthropic API key for scaffold generation |

---

## Option B: GitHub Actions Deployment

If you prefer CI-driven deploys, the `.github/workflows/deploy.yml` workflow handles this.

### 1. Get your Vercel IDs

```bash
npx vercel link        # links project and creates .vercel/project.json
cat .vercel/project.json
# → { "orgId": "...", "projectId": "..." }
```

### 2. Set GitHub Repository Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create token |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` field |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` field |

### 3. Set app environment variables in Vercel dashboard

The workflow pulls env vars from Vercel automatically via `vercel pull`. Set these in Vercel → **Settings** → **Environment Variables**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_APP_URL` | Your production URL |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis |
| `ANTHROPIC_API_KEY` | Anthropic API key for scaffold generation |

---

## Update GitHub OAuth App

Once deployed, update your GitHub OAuth App callback URL:

1. Go to https://github.com/settings/developers
2. Edit your OAuth App
3. Set **Authorization callback URL** to:
   `https://your-app.vercel.app/api/auth/github/callback`

## Run Database Migration

Run the schema SQL in your Supabase SQL Editor:

```sql
-- Paste contents of scripts/01-create-schema.sql
```

Or use psql:

```bash
psql $DATABASE_URL -f scripts/01-create-schema.sql
```

## Troubleshooting

**GitHub OAuth redirects fail** → Check `NEXT_PUBLIC_APP_URL` matches your Vercel URL exactly

**Database errors** → Verify `DATABASE_URL` is correct and Supabase project is active

**AI analysis fails** → Check `OPENAI_API_KEY` has sufficient credits

**Scaffold generation fails** → Check `ANTHROPIC_API_KEY` is set and valid

**GitHub Actions deploy fails** → Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set as GitHub secrets
