# Repo Architect

AI-powered GitHub repository analysis. Analyze repos, discover projects you can build from existing code, find reusable files, and export PDF blueprints.

## Features

- **Single repo analysis** – Deep analysis with tech stack, architecture, dependencies, and suggested improvements
- **Discover projects** – Scans your repos and suggests applications you can build by combining files
- **Find files for project** – Describe what you're building; get a list of reusable files from your repos
- **Copy to new repo** – One-click copy of existing files into a new GitHub repo
- **Share blueprints** – Generate shareable links for analysis and discovery results
- **GitHub OAuth** – Sign in with GitHub to use your own repos (or use GITHUB_TOKEN fallback)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and configure:

   - `GITHUB_ID` / `GITHUB_SECRET` – Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers). Use `http://localhost:3000/api/auth/callback/github` as callback URL.
   - `GITHUB_TOKEN` – Fallback PAT with repo read access (optional if using OAuth)
   - `OPENAI_API_KEY` – From [OpenAI](https://platform.openai.com/api-keys)
   - `NEXTAUTH_SECRET` – Run `openssl rand -base64 32`
   - `NEXTAUTH_URL` – `http://localhost:3000` (or your deploy URL)
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` – For Share feature (optional)

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Database (Share feature)

If using Share blueprints, ensure Supabase has the `repo_blueprints` table. Run the migration:

```sql
-- In Supabase SQL Editor, or: supabase db push
-- See supabase/migrations/20250221000000_create_repo_blueprints.sql
```

## Production & Deployment

- **Health check:** `GET /api/health` – use for uptime monitoring (UptimeRobot, Vercel Health Checks, etc.)
- **Deployment checklist:** See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for full production setup and what to do before charging customers.
