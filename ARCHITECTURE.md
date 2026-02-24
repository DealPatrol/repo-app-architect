# TaskFlow - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React 19.2 / Next.js 16                          │  │
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
│  - Dashboard   │      │  - Styles       │
│  - Projects    │      │  - Icons        │
│  - Tasks       │      └─────────────────┘
│  - Analytics   │
└────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  /api/projects        - Project management                    │ │
│  │  /api/upload          - File uploads to Blob                  │ │
│  │  /api/projects/[id]/tasks        - Task CRUD                  │ │
│  │  /api/projects/[id]/comments     - Comments                   │ │
│  │  /api/projects/[id]/attachments  - File attachments           │ │
│  │  /api/projects/[id]/members      - Team management            │ │
│  │  /api/projects/[id]/activity     - Activity logs              │ │
│  │  /api/projects/[id]/analytics    - Project metrics            │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Neon PostgreSQL                                   │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  Projects Table         - Project metadata              │ │ │
│  │  │  Tasks Table            - Task data & status            │ │ │
│  │  │  Task_Comments Table    - Discussion threads            │ │ │
│  │  │  Task_Attachments Table - File references               │ │ │
│  │  │  Project_Members Table  - Team & roles                  │ │ │
│  │  │  Activity_Logs Table    - Audit trail                   │ │ │
│  │  │  Stack Auth Tables      - Users & orgs                  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      SERVICES                                        │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐ │
│  │   Vercel Blob              │  │   Stack Auth                 │ │
│  │   ├─ File uploads          │  │   ├─ User management        │ │
│  │   ├─ File storage          │  │   ├─ Organization mgmt      │ │
│  │   └─ CDN delivery          │  │   └─ Session management     │ │
│  └─────────────────────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Task
```
User Input (Task Form)
        │
        ▼
React Component State
        │
        ▼
POST /api/projects/[id]/tasks
        │
        ├─ Validate input
        ├─ Create activity log
        ├─ Insert into tasks table
        │
        ▼
Neon Database (persisted)
        │
        ▼
Response with new task
        │
        ▼
Update React state + UI
        │
        ▼
Activity log displays in feed
```

### Uploading a File
```
File Selection (Uploader)
        │
        ▼
FormData with file
        │
        ▼
POST /api/upload
        │
        ├─ Validate file size
        ├─ Upload to Vercel Blob
        │
        ▼
Blob returns file URL
        │
        ▼
POST /api/projects/[id]/tasks/[taskId]/attachments
        │
        ├─ Save metadata to database
        ├─ Create activity log
        │
        ▼
Neon Database (persisted)
        │
        ▼
Display attachment in UI
```

## Authentication Flow

```
User
  │
  ▼
Stack Auth Provider
  │
  ├─ Sign Up
  ├─ Sign In
  ├─ Session Management
  │
  ▼
User Context
  │
  ├─ User ID
  ├─ Organization ID
  ├─ User Role
  │
  ▼
Protected Routes
  │
  ├─ Dashboard (requires auth)
  ├─ Projects (requires org)
  ├─ Settings (requires permissions)
  │
  ▼
API Requests (with user context)
```

## Database Relationships

```
neon_auth.organization
        │
        ├─── projects.organization_id
        │         │
        │         ├─── tasks.project_id
        │         │     │
        │         │     ├─── task_comments.task_id
        │         │     └─── task_attachments.task_id
        │         │
        │         ├─── project_members.project_id
        │         │
        │         └─── activity_logs.project_id
        │
        └─── neon_auth.user
               │
               ├─── projects.created_by
               ├─── tasks.created_by / assigned_to
               ├─── task_comments.author_id
               ├─── project_members.user_id
               └─── activity_logs.user_id
```

## Component Architecture

```
RootLayout
  └─ dark theme
     └─ Providers
        
        Dashboard Layout
          ├─ Header
          ├─ Sidebar
          │   ├─ Navigation
          │   └─ User Menu
          │
          └─ Main Content
             
             ProjectsPage
               └─ ProjectsList
                   └─ ProjectCard[]
             
             ProjectDetailPage
               ├─ ProjectHeader
               ├─ TabNavigation
               │   ├─ Overview
               │   ├─ Tasks
               │   ├─ Analytics
               │   └─ Settings
               │
               ├─ TasksPage (Kanban)
               │   └─ KanbanBoard
               │       ├─ Column[status]
               │       │   └─ TaskCard[]
               │       │       └─ DragDropContext
               │
               ├─ AnalyticsPage
               │   └─ AnalyticsDashboard
               │       ├─ KPICards
               │       ├─ Charts
               │       └─ TeamTable
               │
               ├─ SettingsPage
               │   ├─ ProjectInfo
               │   └─ TeamSettings
               │
               └─ TaskDetailPage
                   ├─ TaskHeader
                   ├─ TaskComments
                   ├─ FileUploader
                   └─ ActivityFeed
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Your App (Deployed)                      │ │
│  │  ├─ /dashboard       - ISR                            │ │
│  │  ├─ /api/*           - Serverless Functions           │ │
│  │  └─ /public          - Static Assets (Cached)         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                      │                    │
         │                      │                    │
    ┌────▼────┐            ┌────▼────┐         ┌────▼────┐
    │  Neon   │            │  Vercel │         │ Vercel  │
    │PostgreSQL            │   Blob  │         │Analytics│
    └────────┘             └────────┘         └────────┘
```

## Security Layers

```
User Request
    │
    ├─ Browser (Client-side)
    │   └─ Validate inputs
    │
    ├─ HTTPS/TLS (Transport)
    │   └─ Encrypted in transit
    │
    ├─ Vercel Edge (Rate limiting)
    │   └─ DDoS protection
    │
    ├─ Authentication (Stack Auth)
    │   └─ Session validation
    │
    ├─ API Route (Authorization)
    │   ├─ Check user ID
    │   ├─ Check role/permissions
    │   └─ Validate inputs with Zod
    │
    ├─ Database (Query Parameters)
    │   └─ Parameterized queries (SQL injection prevention)
    │
    └─ Application Logic
        └─ Business rule validation
```

## Performance Optimization

```
Client Performance
  ├─ Code splitting
  ├─ Lazy loading
  └─ Image optimization

Server Performance
  ├─ Database indexes
  ├─ Query optimization
  └─ Connection pooling

Caching Strategy
  ├─ Browser cache (static assets)
  ├─ CDN cache (Vercel Blob)
  ├─ API response cache
  └─ Database query cache

Monitoring
  ├─ Vercel Analytics
  ├─ Error tracking
  └─ Performance metrics
```

## Scalability

```
Single User → Multiple Teams
    ├─ Organization isolation (via Stack Auth)
    └─ Database partitioning ready

Single Project → 1000s of Projects
    ├─ Database indexes on project_id
    ├─ Pagination implemented
    └─ Activity log archiving ready

Small Team → 1000s of Team Members
    ├─ Role-based permissions
    ├─ Bulk operations support
    └─ Team invite system

Storage Growth
    ├─ Vercel Blob (unlimited)
    └─ Database optimization queries
```

This architecture supports growing from a startup to an enterprise SaaS with thousands of users!
