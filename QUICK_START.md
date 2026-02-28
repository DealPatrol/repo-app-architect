# TaskFlow - Quick Start Guide

## What You Have

A fully functional, production-ready project management SaaS with:
- Database schema for projects, tasks, comments, attachments, and team management
- Complete REST API with 8+ endpoints
- Beautiful React UI with kanban board, analytics, and team collaboration
- Real-time activity tracking
- File upload capability with Vercel Blob
- Dark theme with responsive mobile design

## Essential Setup Steps

### 1. Verify Environment Variables
Check your Vercel project settings and ensure these are set:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob token
- Stack Auth credentials (if not auto-configured)

Optional helper command:
```bash
pnpm env:setup
```
This scans the codebase, attempts autofetch from authenticated provider sessions (Vercel/Neon), then prompts for any remaining values before writing `.env.local`.

For best automation:
```bash
vercel login && vercel link
# optional Neon API autofetch
export NEON_API_KEY=...
export NEON_PROJECT_ID=...
```

### 2. Database Ready
The database schema is already created in Neon with:
- All 6 tables set up
- Indexes for performance
- Foreign key relationships
- Ready for data

### 3. Start Development Server
```bash
pnpm dev
```

Then navigate to:
- **http://localhost:3000/dashboard** - Main app
- **http://localhost:3000/dashboard/projects** - Projects list
- **http://localhost:3000/dashboard/projects/[id]/tasks** - Kanban board

## File Structure Overview

```
Key Files to Know:

📂 /app
  📂 /api - All your API endpoints
    📂 /projects - Project CRUD
    📂 /upload - File upload
    
  📂 /dashboard - User interface
    📂 /projects/[id] - Project pages

📂 /components
  kanban-board.tsx - Drag & drop tasks
  task-comments.tsx - Task discussion
  file-uploader.tsx - File uploads
  analytics-dashboard.tsx - Charts & stats
  
📂 /lib
  db.ts - Database connection
  queries.ts - SQL queries

📂 /scripts
  01-create-schema.sql - Database setup (already executed)
```

## How to Extend

### Add a New Feature
1. Create database migration if needed
2. Add API route in `/app/api`
3. Create React component in `/components`
4. Add page in `/app/dashboard`

### Add a New API Endpoint
```typescript
// /app/api/projects/[id]/new-feature/route.ts
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  const result = await db.query('SELECT * FROM table WHERE id = $1', [params.id])
  return NextResponse.json(result.rows)
}
```

### Add a New Component
```typescript
// /components/my-component.tsx
'use client'
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <div>My Component</div>
}
```

## Database Query Examples

```typescript
// Get projects for user
const projects = await db.query(
  'SELECT * FROM projects WHERE organization_id = $1',
  [orgId]
)

// Get tasks with status
const tasks = await db.query(
  'SELECT * FROM tasks WHERE project_id = $1 AND status = $2',
  [projectId, 'in_progress']
)

// Add comment
const comment = await db.query(
  `INSERT INTO task_comments (task_id, author_id, content)
   VALUES ($1, $2, $3) RETURNING *`,
  [taskId, userId, 'Comment text']
)
```

## Available API Endpoints

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/[id]
PUT    /api/projects/[id]
DELETE /api/projects/[id]
```

### Tasks
```
GET    /api/projects/[id]/tasks
POST   /api/projects/[id]/tasks
PUT    /api/projects/[id]/tasks/[taskId]
DELETE /api/projects/[id]/tasks/[taskId]
```

### Comments
```
GET    /api/projects/[id]/tasks/[taskId]/comments
POST   /api/projects/[id]/tasks/[taskId]/comments
DELETE /api/projects/[id]/tasks/[taskId]/comments/[id]
```

### Attachments
```
GET    /api/projects/[id]/tasks/[taskId]/attachments
POST   /api/projects/[id]/tasks/[taskId]/attachments
DELETE /api/projects/[id]/tasks/[taskId]/attachments/[id]
```

### Team & Analytics
```
GET    /api/projects/[id]/members
POST   /api/projects/[id]/members
DELETE /api/projects/[id]/members/[id]

GET    /api/projects/[id]/activity
GET    /api/projects/[id]/analytics
```

## Component Hierarchy

```
<RootLayout>
  <DashboardLayout>
    ├── <Sidebar>
    ├── <ProjectsList>
    ├── <ProjectDetail>
    │   ├── <KanbanBoard>
    │   │   └── <TaskCard>
    │   ├── <TaskDetail>
    │   │   ├── <TaskComments>
    │   │   └── <FileUploader>
    │   ├── <AnalyticsDashboard>
    │   │   └── <Charts>
    │   └── <TeamSettings>
```

## Performance Tips

1. **Database Queries**: Use the indexes on project_id, status, assigned_to
2. **Images**: All tasks and projects use hex color codes (no images needed)
3. **Caching**: Consider adding ISR for projects list
4. **Pagination**: Implement for large task lists

## Troubleshooting

**Database Connection Error?**
- Check DATABASE_URL is correct
- Verify Neon project is active
- Test connection string in psql

**Blob Upload Not Working?**
- Verify BLOB_READ_WRITE_TOKEN is set
- Check file size < 100MB
- Ensure API route returns proper JSON

**Components Not Rendering?**
- Check 'use client' directive for interactive components
- Verify imports are correct
- Check console for errors

## What's Next?

1. **Deploy to Vercel** - One-click deployment
2. **Add Email Notifications** - Send task updates to team
3. **Custom Workflows** - Automate task transitions
4. **Mobile App** - React Native version
5. **Integration APIs** - Slack, GitHub, Zapier

## Support & Resources

- **Documentation**: See README.md for full docs
- **Database Schema**: See IMPLEMENTATION_SUMMARY.md
- **Code Examples**: Check existing API routes and components

---

You now have a production-grade SaaS! Start testing, customize colors/branding, and you're ready to sell. 🚀
