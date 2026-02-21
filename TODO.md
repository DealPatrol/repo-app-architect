# Tomorrow's To-Do List

## Setup & Configuration
- [ ] Run `npm install` (next-auth, supabase)
- [ ] Add to `.env.local`: `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Create GitHub OAuth App at https://github.com/settings/developers
- [ ] Callback URL: `http://localhost:3000/api/auth/callback/github`
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Optional: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Share feature

## Testing
- [ ] Sign in with GitHub and verify Discover / Find Files work
- [ ] Test Copy to new repo
- [ ] Test Share blueprint
- [ ] Verify PDF export for all formats
