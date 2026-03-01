# env-agent-finder

A zero-dependency CLI tool that scans any codebase to discover:

- **Environment variables** — finds every `process.env.*` reference, `.env` file, and maps them to known services
- **API routes** — detects Next.js App/Pages Router, Express, FastAPI, and Flask endpoints
- **Service dependencies** — identifies databases, auth providers, storage, payments, AI, email, and more

Built for AI agents and developers who need to quickly understand what a project needs to run.

## Quick Start

```bash
# Scan current directory
node src/cli.js

# Scan a specific project
node src/cli.js --target /path/to/project

# Show env values (masked for security)
node src/cli.js --target ./my-app --show-values

# Show full unmasked values
node src/cli.js --target ./my-app --unmask

# Output as Markdown
node src/cli.js --target ./my-app --format markdown --output report.md

# Output as JSON (with values)
node src/cli.js --format json --show-values
```

## Installation

No dependencies required — just clone and run:

```bash
git clone https://github.com/DealPatrol/env-agent-finder.git
cd env-agent-finder
node src/cli.js --target /path/to/your/project
```

Or use npx (after publishing):

```bash
npx env-agent-finder --target ./my-project
```

## Output Modes

### Default — summary table
```
🔑 ENVIRONMENT VARIABLES (5 found)
  Variable                   Service                    Refs  Status
  DATABASE_URL               Database (PostgreSQL)      3     ✅ Set
  BLOB_READ_WRITE_TOKEN      Vercel Blob Storage        1     ⚪ Optional
  STACK_PROJECT_ID           Stack Auth                 1     ❌ Missing

  💡 Use --show-values to see values, or --unmask for full values.
```

### `--show-values` — masked values with source
```
  ✅ DATABASE_URL
     Service:  Database (PostgreSQL/MySQL)
     Refs:     3 reference(s) in code
     Value:    post••••••••••••••••••••••••••••••flow
     Source:   .env.local

  ❌ BLOB_READ_WRITE_TOKEN
     Service:  Vercel Blob Storage
     Refs:     1 reference(s) in code
     Value:    (not set)
```

### `--unmask` — full raw values
```
  ✅ DATABASE_URL
     Service:  Database (PostgreSQL/MySQL)
     Refs:     3 reference(s) in code
     Value:    postgresql://user:pass@host:5432/mydb
     Source:   .env.local

📄 CURRENT .env VALUES
  DATABASE_URL=postgresql://user:pass@host:5432/mydb
  STACK_PROJECT_ID=proj_abc123
```

## Options

| Flag | Description |
|------|-------------|
| `--target <dir>` | Directory to scan (default: current directory) |
| `--show-values`, `-v` | Show env variable values (masked by default) |
| `--unmask` | Show full unmasked values (implies `--show-values`) |
| `--format <type>` | Output format: `terminal`, `json`, `markdown` (default: `terminal`) |
| `--output <file>` | Write output to file instead of stdout |
| `-h`, `--help` | Show help message |

## What It Detects

### Environment Variables
- `process.env.VAR_NAME` (Node.js)
- `os.environ` / `os.getenv()` (Python)
- `import.meta.env.VAR_NAME` (Vite)
- `.env`, `.env.local`, `.env.example` files
- 50+ well-known service variable mappings

### API Routes
- Next.js App Router (`app/api/**/route.ts`)
- Next.js Pages Router (`pages/api/**/*.ts`)
- Express / Fastify (`app.get()`, `router.post()`, etc.)
- FastAPI / Flask (`@app.get()`, `@router.post()`, etc.)

### Services (30+ supported)
| Category | Services |
|----------|----------|
| Database | PostgreSQL, MySQL, MongoDB, Supabase, Firebase |
| Auth | NextAuth, Clerk, Stack Auth, Auth.js |
| Storage | Vercel Blob, AWS S3, Cloudinary |
| Payments | Stripe |
| AI | OpenAI, Anthropic |
| Email | SendGrid, Resend, SMTP |
| Monitoring | Sentry |
| Cache | Redis, Upstash |
| Messaging | Twilio |

## Setup Mode — Auto-Provision Your `.env`

The killer feature: point it at any project and it **builds your `.env.local` for you**.

### `--setup` (Interactive)

Scans the project, auto-generates secrets and DB URLs, then walks you through each external service with step-by-step signup instructions and prompts you to paste your keys:

```bash
node src/cli.js --target ./my-project --setup
```

```
════════════════════════════════════════════════════════════
  ENV AGENT FINDER — Setup Mode
════════════════════════════════════════════════════════════

  Found 8 environment variable(s) needed.
  Detected 4 service(s): PostgreSQL, Stripe, OpenAI, Auth.js

⚡ AUTO-GENERATING values...
────────────────────────────────────────
  ✅ DATABASE_URL = postgresql://postgres:postgres@localhost:5432/app_dev
  ✅ NEXTAUTH_SECRET = a8Kx9mP2qR7...
  ✅ NEXTAUTH_URL = http://localhost:PORT

🔑 STRIPE
────────────────────────────────────────
  How to get your keys:
  1. Go to https://dashboard.stripe.com/register and create an account
  2. Go to https://dashboard.stripe.com/apikeys
  3. Copy your Publishable key → STRIPE_PUBLISHABLE_KEY
  4. Copy your Secret key → STRIPE_SECRET_KEY

  Enter STRIPE_SECRET_KEY (or press Enter to skip): sk_test_abc123
  ✅ STRIPE_SECRET_KEY saved

🔑 OPENAI
────────────────────────────────────────
  How to get your keys:
  1. Go to https://platform.openai.com/api-keys
  2. Click 'Create new secret key'

  Enter OPENAI_API_KEY (or press Enter to skip): sk-proj-abc123
  ✅ OPENAI_API_KEY saved

════════════════════════════════════════════════════════════
  SETUP COMPLETE — Written to: ./my-project/.env.local
════════════════════════════════════════════════════════════
```

### `--auto` (Non-Interactive)

Auto-generates everything it can (secrets, database URLs) without prompting. Perfect for CI or AI agents:

```bash
node src/cli.js --target ./my-project --auto
```

### What Gets Auto-Generated vs What You Need to Provide

| Type | Example Variables | How It's Handled |
|------|-------------------|------------------|
| **Secrets** | `NEXTAUTH_SECRET`, `JWT_SECRET`, `AUTH_SECRET` | Auto-generated (random 48-char string) |
| **Database URLs** | `DATABASE_URL`, `POSTGRES_URL`, `MONGODB_URI` | Auto-generated (local dev defaults) |
| **App URLs** | `NEXTAUTH_URL`, `APP_URL` | Auto-generated (localhost dev URL) |
| **API Keys** | `STRIPE_SECRET_KEY`, `OPENAI_API_KEY` | Interactive prompt with signup instructions |
| **OAuth Creds** | `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Interactive prompt with setup guide |
| **Existing Values** | Any var already in `.env` | Kept as-is (never overwritten) |

### Supported Services (with signup guides)

Stripe, OpenAI, Anthropic, Clerk, Stack Auth, Supabase, Firebase, Vercel Blob, AWS S3, SendGrid, Resend, Sentry, Google OAuth, GitHub OAuth, Twilio, Cloudinary, Upstash Redis

## Use Cases

- **New project setup**: Clone a repo, run `--setup`, get a working `.env.local` in 60 seconds
- **AI Agents**: Run `--auto` to provision env vars without human interaction
- **Onboarding**: New developer? Run `--setup` and follow the guided prompts
- **CI/CD**: Validate that all required secrets are configured with scan mode
- **Documentation**: Auto-generate env var docs with `--format markdown`
- **Security Audits**: Find all external service dependencies and API key usage

## License

MIT
