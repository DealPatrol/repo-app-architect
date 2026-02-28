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

# Output as Markdown
node src/cli.js --target ./my-app --format markdown --output report.md

# Output as JSON
node src/cli.js --format json
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

## Output Example

```
════════════════════════════════════════════════════════════
  ENV AGENT FINDER — Scan Report
════════════════════════════════════════════════════════════

📦 PROJECT INFO
────────────────────────────────────
  Name:            my-project
  Framework:       Next.js 16.1.6
  Language:        JavaScript/TypeScript
  Package Manager: pnpm

🔑 ENVIRONMENT VARIABLES (5 found)
────────────────────────────────────
  Variable                   Service                    Refs  Status
  DATABASE_URL               Database (PostgreSQL)      3     ❌ Missing
  BLOB_READ_WRITE_TOKEN      Vercel Blob Storage        1     ⚪ Optional
  STACK_PROJECT_ID           Stack Auth                 1     ❌ Missing
  STACK_PUBLISHED_CLIENT_KEY Stack Auth                 1     ❌ Missing
  STACK_SECRET_SERVER_KEY    Stack Auth                 1     ❌ Missing

🔌 DETECTED SERVICES (4 found)
────────────────────────────────────
  PostgreSQL
    Category:   database
    Confidence: ████████░░ 80%
    Packages:   pg, @neondatabase/serverless
    Env Vars:   DATABASE_URL

  Stack Auth
    Category:   auth
    Confidence: ██████████ 100%
    Packages:   @stack-auth/nextjs
    Env Vars:   STACK_PROJECT_ID, STACK_SECRET_SERVER_KEY

🌐 API ROUTES (8 found)
────────────────────────────────────
  /api/projects                                    [GET, POST]
  /api/projects/[id]/activity                      [GET, POST]
  /api/projects/[id]/analytics                     [GET]
  /api/projects/[id]/members                       [GET, POST, DELETE]
  /api/projects/[id]/tasks                         [GET, POST, PUT, DELETE]
  /api/projects/[id]/tasks/[taskId]/attachments     [GET, POST, DELETE]
  /api/projects/[id]/tasks/[taskId]/comments        [GET, POST, DELETE]
  /api/upload                                      [POST]
```

## Output Formats

| Format | Flag | Description |
|--------|------|-------------|
| Terminal | `--format terminal` | Colorful CLI output (default) |
| Markdown | `--format markdown` | Markdown report for docs/PRs |
| JSON | `--format json` | Machine-readable for pipelines |

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

## Use Cases

- **AI Agents**: Automatically discover what env vars and services a project needs before setting up
- **Onboarding**: Generate a setup checklist for new developers
- **CI/CD**: Validate that all required secrets are configured
- **Documentation**: Auto-generate env var docs for your README
- **Security Audits**: Find all external service dependencies

## License

MIT
