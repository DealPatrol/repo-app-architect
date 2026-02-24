# TaskFlow - Project Management SaaS

A production-ready project and task management platform built with Next.js 16, Neon PostgreSQL, Stack Auth, and Vercel Blob.

## Features

- **Project Management**: Create, organize, and manage multiple projects with custom colors and descriptions
- **Task Management**: Full-featured kanban board with drag-and-drop task organization
- **Team Collaboration**: Real-time team member management with role-based access control
- **Comments & Discussion**: Add comments to tasks for inline collaboration
- **File Attachments**: Upload and manage files with Vercel Blob storage
- **Activity Tracking**: Comprehensive activity logs for project insights
- **Analytics Dashboard**: Task completion rates, team performance metrics, and productivity insights
- **Responsive Design**: Mobile-first design that works perfectly on all devices

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Neon PostgreSQL with connection pooling
- **Authentication**: Stack Auth
- **File Storage**: Vercel Blob
- **UI Components**: Shadcn UI with Radix primitives
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts for analytics visualization
- **Forms**: React Hook Form + Zod validation

## Project Structure

```
app/
├── api/                              # API Routes
│   ├── upload/                       # File upload endpoint
│   └── projects/[id]/
│       ├── tasks/                    # Task management
│       ├── comments/                 # Task comments
│       ├── attachments/              # File attachments
│       ├── members/                  # Team member management
│       ├── activity/                 # Activity logs
│       └── analytics/                # Analytics data
├── dashboard/                        # Dashboard pages
│   ├── layout.tsx                    # Dashboard layout with sidebar
│   ├── page.tsx                      # Dashboard overview
│   └── projects/
│       ├── page.tsx                  # Projects list
│       └── [id]/
│           ├── page.tsx              # Project overview
│           ├── tasks/                # Kanban board view
│           ├── analytics/            # Project analytics
│           └── settings/             # Project settings
components/
├── kanban-board.tsx                  # Drag-and-drop task board
├── task-comments.tsx                 # Comment component
├── file-uploader.tsx                 # File upload component
├── activity-feed.tsx                 # Activity log display
├── analytics-dashboard.tsx           # Analytics visualization
├── team-settings.tsx                 # Team management
└── ui/                               # Shadcn components
lib/
├── db.ts                             # Database client
└── queries.ts                        # Database queries
scripts/
└── 01-create-schema.sql              # Database migration
```

## Database Schema

### Projects
- `id`: UUID (Primary Key)
- `organization_id`: UUID (Foreign Key to Stack Auth)
- `name`: VARCHAR(255)
- `description`: TEXT
- `slug`: VARCHAR(255)
- `status`: VARCHAR(50) - active/archived/deleted
- `visibility`: VARCHAR(50) - private/public
- `color`: VARCHAR(7) - Hex color code
- `icon`: VARCHAR(50)
- `created_by`: UUID (Foreign Key to User)
- `created_at`, `updated_at`: TIMESTAMP

### Tasks
- `id`: UUID (Primary Key)
- `project_id`: UUID (Foreign Key)
- `title`: VARCHAR(255)
- `description`: TEXT
- `status`: VARCHAR(50) - todo/in_progress/in_review/done
- `priority`: VARCHAR(50) - low/medium/high/urgent
- `assigned_to`: UUID (Foreign Key to User)
- `created_by`: UUID (Foreign Key to User)
- `due_date`: DATE
- `order_index`: INTEGER (For ordering in kanban)
- `created_at`, `updated_at`: TIMESTAMP

### Task Comments
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key)
- `author_id`: UUID (Foreign Key)
- `content`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

### Task Attachments
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key)
- `uploaded_by`: UUID (Foreign Key)
- `file_name`: VARCHAR(255)
- `file_url`: TEXT (Vercel Blob URL)
- `file_size`: BIGINT
- `mime_type`: VARCHAR(100)
- `created_at`: TIMESTAMP

### Project Members
- `id`: UUID (Primary Key)
- `project_id`: UUID (Foreign Key)
- `user_id`: UUID (Foreign Key)
- `role`: VARCHAR(50) - owner/admin/member/viewer
- `added_at`: TIMESTAMP

### Activity Logs
- `id`: UUID (Primary Key)
- `project_id`: UUID (Foreign Key)
- `user_id`: UUID (Foreign Key)
- `action`: VARCHAR(100)
- `entity_type`: VARCHAR(50) - task/comment/attachment/project
- `entity_id`: UUID
- `description`: TEXT
- `metadata`: JSONB
- `created_at`: TIMESTAMP

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskflow
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
STACK_PROJECT_ID=...
STACK_PUBLISHED_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Access the application**
Open http://localhost:3000 in your browser

## API Endpoints

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PUT /api/projects/[id]` - Update project

### Tasks
- `GET /api/projects/[id]/tasks` - List tasks
- `POST /api/projects/[id]/tasks` - Create task
- `PUT /api/projects/[id]/tasks/[taskId]` - Update task
- `DELETE /api/projects/[id]/tasks/[taskId]` - Delete task

### Comments
- `GET /api/projects/[id]/tasks/[taskId]/comments` - List comments
- `POST /api/projects/[id]/tasks/[taskId]/comments` - Add comment
- `DELETE /api/projects/[id]/tasks/[taskId]/comments/[commentId]` - Delete comment

### Attachments
- `GET /api/projects/[id]/tasks/[taskId]/attachments` - List attachments
- `POST /api/projects/[id]/tasks/[taskId]/attachments` - Add attachment
- `DELETE /api/projects/[id]/tasks/[taskId]/attachments/[attachmentId]` - Delete attachment

### Team
- `GET /api/projects/[id]/members` - List team members
- `POST /api/projects/[id]/members` - Add team member
- `DELETE /api/projects/[id]/members/[memberId]` - Remove team member

### Analytics
- `GET /api/projects/[id]/analytics` - Get project analytics
- `GET /api/projects/[id]/activity` - Get activity log

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application is optimized for Vercel with:
- Edge-ready API routes
- Blob storage integration
- Automatic deployments

## Performance Optimizations

- Database indexes on frequently queried columns
- Pagination for large datasets
- Optimized images and assets
- Code splitting and lazy loading
- CSS variable-based theming system

## Security Considerations

- Row-level security implemented at database level
- Role-based access control for team members
- File upload validation and size limits
- XSS protection via React's built-in escaping
- CSRF protection via Next.js

## Future Enhancements

- Real-time collaboration with WebSockets
- Custom workflows and automation
- Time tracking and reporting
- Integration with external tools (Slack, GitHub, etc.)
- Advanced search and filtering
- Custom notification preferences
- Team templates and workflows

## Support

For issues and feature requests, please open an issue on GitHub or contact support.

## License

MIT License - feel free to use this project for personal or commercial purposes.
