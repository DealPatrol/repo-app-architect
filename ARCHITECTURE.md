# RepoFuse - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React 19.2 / Next.js 16 (App Router)            │  │
│  │         (Dark Theme, Responsive Mobile-First)                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
         ┌──────────▼──────────┐  ┌──────────▼──────────┐
         │   Next.js 16 App    │  │   Vercel Edge       │
         │   Router (SSR/CSR)  │  │   Network           │
         └──────────┬──────────┘  └─────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐      ┌────────▼────────┐
│  /app/routes   │      │  /public/assets │
│  - Home        │      │  - Styles       │
│  - Dashboard   │      │  - Icons        │
│  - Repos       │      └─────────────────┘
│  - Analyses    │
└────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  /api/auth/github/callback  - GitHub OAuth flow               │ │
│  │  /api/github/repos          - Fetch user's GitHub repos       │ │
│  │  /api/github/create-repo    - Create repo from blueprint      │ │
│  │  /api/repositories          - Repository CRUD                 │ │
│  │  /api/analyses              - Analysis management             │ │
│  │  /api/analyses/[id]/run     - Run analysis (SSE stream)       │ │
│  │  /api/analyses/[id]/analyze - AI cross-repo pattern analysis  │ │
│  │  /api/export/blueprint      - Export blueprint as JSON        │ │
│  │  /api/export/pdf            - Export blueprint as PDF         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Neon PostgreSQL                                   │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  user_auth Table          - GitHub OAuth users          │ │ │
│  │  │  repositories Table       - Tracked GitHub repos        │ │ │
│  │  │  repo_files Table         - Scanned files + AI metadata │ │ │
│  │  │  analyses Table           - Analysis run records        │ │ │
│  │  │  analysis_repositories    - Junction table              │ │ │
│  │  │  app_blueprints Table     - AI-discovered app ideas     │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐ │
│  │   GitHub API               │  │   OpenAI (via Vercel AI SDK) │ │
│  │   ├─ OAuth token exchange   │  │   ├─ File pattern analysis  │ │
│  │   ├─ Repo listing           │  │   ├─ Blueprint generation   │ │
│  │   ├─ File tree traversal    │  │   └─ Gap analysis           │ │
│  │   └─ Repo creation          │  └──────────────────────────────┘ │
│  └─────────────────────────────┘                                    │
└──────────────────────────────────────────────────────────────────────┘
```

## Analysis Flow

```
User selects repositories
        │
        ▼
POST /api/analyses  →  Create analysis record (status: pending)
        │
        ▼
POST /api/analyses/[id]/run  (Server-Sent Events stream)
        │
        ├─ status: scanning (10%)
        │   └─ Fetch file trees from GitHub API for each repo
        │   └─ Save files to repo_files table
        │
        ├─ status: analyzing (50%)
        │   └─ Build file summary string
        │   └─ Send to OpenAI GPT-4o-mini with structured output
        │   └─ AI identifies 2-5 app blueprints
        │
        ├─ status: complete (100%)
        │   └─ Save blueprints to app_blueprints table
        │   └─ Stream final blueprints to client
        │
        └─ status: failed (on error)
```

## Authentication Flow

```
User clicks "Connect GitHub"
        │
        ▼
Redirect to GitHub OAuth
  └─ Scope: read:user, repo (read-only)
        │
        ▼
GET /api/auth/github/callback
  ├─ Exchange code for access_token
  ├─ Fetch GitHub user profile
  ├─ Upsert into user_auth table
  └─ Set github_user_id cookie (httpOnly, secure)
        │
        ▼
Redirect to /dashboard
  └─ All API routes read cookie to authenticate
```

## Database Relationships

```
user_auth
  └─ (owns session, not foreign keyed to other tables)

repositories
  ├─── repo_files.repository_id
  └─── analysis_repositories.repository_id

analyses
  ├─── analysis_repositories.analysis_id
  └─── app_blueprints.analysis_id
```

## Component Architecture

```
RootLayout
  └─ ThemeProvider (dark mode)
     │
     ├─ HomePage (/)
     │
     └─ DashboardLayout (/dashboard/*)
         ├─ Header + Nav
         │
         ├─ DashboardPage (/dashboard)
         │   └─ Stats overview
         │
         ├─ RepositoriesPage (/dashboard/repositories)
         │   └─ RepositoriesList
         │       ├─ Add by URL form
         │       └─ GitHub OAuth import
         │
         └─ AnalysesPage (/dashboard/analyses)
             ├─ AnalysesList
             │   └─ Create analysis form
             │       └─ RepositorySelector
             │
             └─ AnalysisDetailPage (/dashboard/analyses/[id])
                 └─ AnalysisDetail
                     ├─ Progress stream (SSE)
                     ├─ AppSuggestions (blueprint cards)
                     └─ Export controls
```

## Security

```
User Request
    │
    ├─ HTTPS/TLS (Transport)
    │   └─ Encrypted in transit
    │
    ├─ Vercel Edge (Rate limiting / DDoS protection)
    │
    ├─ Session Cookie (httpOnly, secure, SameSite)
    │   └─ github_user_id validated on every API request
    │
    ├─ GitHub OAuth (read-only scopes)
    │   └─ We never write to user repos
    │
    └─ Database
        └─ Parameterized queries (SQL injection prevention)
```
