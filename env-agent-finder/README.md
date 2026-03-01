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

## Use Cases

- **AI Agents**: Automatically discover what env vars and services a project needs before setting up
- **Onboarding**: Generate a setup checklist for new developers
- **CI/CD**: Validate that all required secrets are configured
- **Documentation**: Auto-generate env var docs for your README
- **Security Audits**: Find all external service dependencies

## License

MIT
