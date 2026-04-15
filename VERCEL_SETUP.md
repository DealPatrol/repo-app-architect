# CodeVault - Vercel Deployment Setup

## 1. Set Environment Variables on Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g. `https://codevault.vercel.app`) |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis |

## 2. Update GitHub OAuth App

Once deployed, update your GitHub OAuth App callback URL:

1. Go to https://github.com/settings/developers
2. Edit your OAuth App
3. Set **Authorization callback URL** to:
   `https://your-app.vercel.app/api/auth/github/callback`

## 3. Run Database Migration

Run the schema SQL in your Neon console:

```sql
-- Paste contents of scripts/01-create-schema.sql
```

Or use psql:

```bash
psql $DATABASE_URL -f scripts/01-create-schema.sql
```

## 4. Deploy

```bash
git push origin main
```

Vercel will automatically deploy on push.

## Troubleshooting

**GitHub OAuth redirects fail** → Check `NEXT_PUBLIC_APP_URL` matches your Vercel URL exactly

**Database errors** → Verify `DATABASE_URL` is correct and Neon project is active

**AI analysis fails** → Check `OPENAI_API_KEY` has sufficient credits
