# Repo Architect – Before You Charge Customers

Use this checklist to prepare Repo Architect for production and paid use.

---

## 1. Infrastructure & Deployment

- [ ] **Deploy to production** (Vercel recommended)
  - Connect your GitHub repo: https://vercel.com/new
  - Add all environment variables (see below)
  - Set custom domain if desired

- [ ] **Environment variables** – Add these in Vercel → Settings → Environment Variables:

  | Variable | Required | Description |
  |----------|----------|-------------|
  | `OPENAI_API_KEY` | ✅ Yes | From [OpenAI API keys](https://platform.openai.com/api-keys) |
  | `NEXTAUTH_SECRET` | ✅ Yes | Run `openssl rand -base64 32` |
  | `NEXTAUTH_URL` | ✅ Yes | Your production URL (e.g. `https://yourapp.vercel.app`) |
  | `GITHUB_ID` | ✅ Yes* | GitHub OAuth App Client ID |
  | `GITHUB_SECRET` | ✅ Yes* | GitHub OAuth App Client Secret |
  | `NEXT_PUBLIC_SUPABASE_URL` | Optional | For Share blueprints |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | For Share blueprints |
  | `NEXT_PUBLIC_APP_URL` | Optional | Canonical app URL for share links (defaults to Vercel URL) |
  | `GITHUB_TOKEN` | Optional | Fallback PAT for repo access without OAuth |

  *Required for Discover Projects, Find Files, and Copy to new repo.

- [ ] **GitHub OAuth App**
  - Create at [GitHub Developer Settings](https://github.com/settings/developers)
  - Callback URL: `https://your-production-domain.com/api/auth/callback/github`
  - Add `GITHUB_ID` and `GITHUB_SECRET` to Vercel

---

## 2. Database (Supabase)

- [ ] **Create Supabase project** at [supabase.com](https://supabase.com)

- [ ] **Run migration**
  - In Supabase → SQL Editor, run `supabase/migrations/20250221000000_create_repo_blueprints.sql`
  - Or: `supabase db push` if using Supabase CLI

- [ ] **Add Supabase env vars** to Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Pre-Launch Testing

- [ ] Sign in with GitHub
- [ ] Analyze a public repo (e.g. `vercel/next.js`)
- [ ] Run Discover Projects (requires OAuth)
- [ ] Run Find Reusable Files
- [ ] Export PDF (full, summary, discovered)
- [ ] Share a blueprint (requires Supabase)
- [ ] Copy files to new repo (requires OAuth)

---

## 4. Before Charging Money

### Legal & Compliance

- [ ] **Terms of Service** – Define usage limits, refunds, and liability
- [ ] **Privacy Policy** – How you use GitHub data, OpenAI, cookies, analytics
- [ ] **Cookie consent** – If using analytics or tracking cookies (e.g. GDPR)

### Payments

- [ ] **Payment provider** – Integrate Stripe, Paddle, Lemon Squeezy, etc.
- [ ] **Pricing tiers** – Free vs paid (e.g. analyses/month, API limits)
- [ ] **Billing portal** – Manage subscriptions, invoices, cancel

### Product & UX

- [ ] **Usage limits** – Rate limits or caps per user/tier
- [ ] **Error monitoring** – Sentry, LogRocket, or similar
- [ ] **Uptime monitoring** – UptimeRobot, Better Uptime, etc.
- [ ] **Backup** – Supabase backups; consider retention policy

### Security

- [ ] **Rate limiting** – Prevent abuse (e.g. Upstash Redis, Vercel KV)
- [ ] **Input validation** – Already in place; review for edge cases
- [ ] **Secrets** – Ensure no API keys in client bundle; use server-only env

---

## 5. Optional Improvements

- [ ] **Landing / pricing page** – Explain value and plans
- [ ] **Documentation** – User guide, API docs if you expose an API
- [ ] **Email** – Transactional emails (sign-up, limits, receipts)
- [ ] **Analytics** – Track usage, conversion, retention
- [ ] **Support** – Contact form, help docs, or live chat

---

## Quick Reference

| Task | Where |
|------|-------|
| Deploy | [vercel.com/new](https://vercel.com/new) |
| GitHub OAuth | [github.com/settings/developers](https://github.com/settings/developers) |
| Supabase | [supabase.com](https://supabase.com) |
| OpenAI keys | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
