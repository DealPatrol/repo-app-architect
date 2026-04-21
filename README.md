# CodeVault Backend

An AI-powered code intelligence platform that scans your GitHub repositories and discovers what applications you can build by combining existing files and components.

## Features

- **GitHub OAuth**: Connect your GitHub account with a single click (read-only access)
- **Repository Management**: Add and manage GitHub repositories for analysis
- **AI Code Analysis**: AI scans every file to identify purpose, exports, and reusability
- **App Blueprint Discovery**: Discover applications you can build from your existing code
- **Gap Analysis**: See exactly which files you're missing and generate them with AI
- **Export**: Download blueprint JSON for offline use or share with your team

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Neon PostgreSQL with connection pooling
- **AI**: Vercel AI SDK (OpenAI GPT-4)
- **UI Components**: Shadcn UI with Radix primitives
- **Styling**: Tailwind CSS v4
- **Auth**: GitHub OAuth (custom, read-only)

## Project Structure

```
app/
├── api/                              # API Routes
│   ├── auth/github/callback/         # GitHub OAuth callback
│   ├── github/repos/                 # Fetch user's GitHub repos
│   ├── github/create-repo/           # Create repo from blueprint
│   ├── repositories/                 # Repository CRUD
│   ├── analyses/                     # Analysis management
│   │   └── [id]/
│   │       ├── run/                  # Run analysis (SSE stream)
│   │       └── analyze/              # AI analysis endpoint
│   └── export/
│       ├── blueprint/                # Export blueprint as JSON
│       └── pdf/                      # Export blueprint as PDF
├── dashboard/                        # Dashboard pages
│   ├── layout.tsx                    # Dashboard layout
│   ├── page.tsx                      # Overview
│   ├── repositories/                 # Repository management
│   └── analyses/                     # Analysis pages
│       └── [id]/                     # Analysis detail
components/
├── repositories-list.tsx             # Repository list + add form
├── repository-selector.tsx           # Multi-repo selector
├── analyses-list.tsx                 # Analyses list
├── analysis-detail.tsx               # Analysis results + blueprints
├── app-suggestions.tsx               # App idea cards
└── ui/                               # Shadcn components
lib/
├── db.ts                             # Neon database client
├── queries.ts                        # Database queries
└── utils.ts                          # Utility functions
scripts/
└── 01-create-schema.sql              # Database migration
```

## Database Schema

### user_auth
- `github_id`: Unique GitHub user ID
- `github_username`: GitHub login name
- `github_avatar_url`: Profile picture URL
- `access_token`: OAuth token (stored securely)

### repositories
- `github_id`: Unique GitHub repo ID
- `name`, `full_name`: Repo name and owner/name
- `description`, `url`: Metadata
- `default_branch`, `language`, `stars`: Additional info

### repo_files
- `repository_id`: Foreign key to repositories
- `path`, `name`, `extension`: File location info
- `file_type`: component / hook / utility / api / page / etc.
- `purpose`, `ai_summary`: AI-generated descriptions
- `technologies`, `exports`, `imports`: Detected patterns (JSONB)
- `reusability_score`: 0–100 reusability rating

### analyses
- `name`: User-defined analysis name
- `status`: pending / scanning / analyzing / complete / failed
- `total_files`, `analyzed_files`: Progress tracking

### analysis_repositories
- Junction table linking analyses to repositories

### app_blueprints
- `analysis_id`: Foreign key to analyses
- `name`, `description`, `app_type`: Blueprint info
- `complexity`: simple / moderate / complex
- `reuse_percentage`: How much existing code can be reused
- `existing_files`, `missing_files`: File lists (JSONB)
- `estimated_effort`: Human-readable time estimate
- `technologies`: Detected stack (JSONB)
- `ai_explanation`: AI-written rationale

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd codevault-backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```
# Neon Database
DATABASE_URL=postgresql://...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
# Optional compatibility alias used by some Stack integrations:
NEXT_PUBLIC_STACK_PUBLISHED_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...

# Stripe Billing
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_PRO=...

# Optional app URL override (used for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Or run the env setup agent:
```bash
pnpm env:setup
```
It scans your project, attempts provider autofetch from authenticated sessions, then prompts only for remaining values before writing `.env.local`.

4. **Run the development server**
```bash
pnpm dev
```

6. **Access the application**
Open http://localhost:3000 in your browser

## Environment Setup Agent

This project includes a secure env setup agent at `scripts/env-agent.mjs`.

What it does:
- Detects env vars used in code and docs
- Suggests likely provider docs (Neon, Vercel Blob, Stack Auth, etc.)
- Attempts autofetch from authenticated sources:
  - Current shell environment (`process.env`)
  - Vercel project vars via `vercel env pull`
  - Neon `DATABASE_URL` via Neon API or Neon CLI
- Auto-derives equivalent aliases for common key variants (for example Stack `PUBLISHABLE` / `PUBLISHED` key names)
- Prompts you for any missing values and writes `.env.local`

By default it excludes helper keys used only for autofetch (`NEON_API_KEY`, `NEON_PROJECT_ID`, etc.) so your project env file only contains app/runtime values.

What it does **not** do:
- It does not create API keys for you
- It does not bypass authentication or scrape secrets from websites
- For account-based retrieval, you must sign in through official provider auth flows

Autofetch prerequisites:
```bash
# For Vercel variables
pnpm dlx vercel login
pnpm dlx vercel link

# Optional for Neon API autofetch
export NEON_API_KEY=...
export NEON_PROJECT_ID=...
```

Commands:
```bash
# scan only (no file writes)
pnpm env:scan

# setup with autofetch + prompts (writes .env.local)
pnpm env:setup

# setup with autofetch + auto-bootstrap vercel auth/link when needed
pnpm env:setup:auto

# setup with prompts only (disable autofetch)
pnpm env:setup:manual

# pull from preview or a specific branch on Vercel
node scripts/env-agent.mjs --vercel-environment preview --vercel-git-branch main

# include helper keys used by autofetch logic
node scripts/env-agent.mjs --include-agent-keys

# enable automatic Vercel login/link bootstrap in CLI mode
node scripts/env-agent.mjs --bootstrap-vercel

# generate template file without prompts
node scripts/env-agent.mjs --template-only --non-interactive --output .env.example.generated
```

## API Endpoints

### Authentication
- `GET /api/auth/github/callback` - GitHub OAuth callback

### Repositories
- `GET /api/repositories` - List tracked repositories
- `POST /api/repositories` - Add repository by URL
- `GET /api/repositories/[id]` - Get repository details
- `DELETE /api/repositories/[id]` - Remove repository

### GitHub
- `GET /api/github/repos` - Fetch user's GitHub repos (OAuth)
- `POST /api/github/create-repo` - Create new repo from blueprint

### Analyses
- `GET /api/analyses` - List analyses
- `POST /api/analyses` - Create new analysis
- `POST /api/analyses/[id]/run` - Run analysis (Server-Sent Events)
- `POST /api/analyses/[id]/analyze` - AI pattern analysis

### Export
- `POST /api/export/blueprint` - Export blueprint as JSON
- `POST /api/export/pdf` - Export blueprint as PDF

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard (see `.env.example`)
4. Deploy

## Security

- GitHub OAuth uses read-only scopes — we never write to your repos
- Access tokens are stored in the database (encrypt at rest in production)
- Code is scanned in memory; file contents are never permanently stored
- All API routes validate authentication via session cookie

## License

MIT License
