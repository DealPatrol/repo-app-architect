-- Create public schema for project management
CREATE SCHEMA IF NOT EXISTS public;

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES neon_auth.organization(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  created_by UUID NOT NULL REFERENCES neon_auth.user(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, slug)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES neon_auth.user(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES neon_auth.user(id) ON DELETE SET NULL,
  due_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task Comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task Attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Members table (for team collaboration)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Project Activity Log table (for real-time updates and analytics)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Projects - users can see projects from their organization
CREATE POLICY "Users can view projects in their organization" ON public.projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM neon_auth.member 
      WHERE user_id = (SELECT id FROM neon_auth.user WHERE email = current_user)
    )
  );

-- RLS Policy: Projects - only project owner can update
CREATE POLICY "Project owner can update" ON public.projects
  FOR UPDATE
  USING (created_by = (SELECT id FROM neon_auth.user WHERE email = current_user));

-- RLS Policy: Tasks - users can view tasks in their projects
CREATE POLICY "Users can view tasks in their projects" ON public.tasks
  FOR SELECT
  USING (
    project_id IN (
      SELECT projects.id FROM public.projects
      INNER JOIN public.project_members ON projects.id = project_members.project_id
      WHERE project_members.user_id = (SELECT id FROM neon_auth.user WHERE email = current_user)
    )
  );

-- RLS Policy: Task Comments - users can view comments on tasks they can access
CREATE POLICY "Users can view task comments" ON public.task_comments
  FOR SELECT
  USING (
    task_id IN (
      SELECT tasks.id FROM public.tasks
      INNER JOIN public.projects ON tasks.project_id = projects.id
      INNER JOIN public.project_members ON projects.id = project_members.project_id
      WHERE project_members.user_id = (SELECT id FROM neon_auth.user WHERE email = current_user)
    )
  );

-- RLS Policy: Task Attachments - users can view attachments on tasks they can access
CREATE POLICY "Users can view task attachments" ON public.task_attachments
  FOR SELECT
  USING (
    task_id IN (
      SELECT tasks.id FROM public.tasks
      INNER JOIN public.projects ON tasks.project_id = projects.id
      INNER JOIN public.project_members ON projects.id = project_members.project_id
      WHERE project_members.user_id = (SELECT id FROM neon_auth.user WHERE email = current_user)
    )
  );

-- RLS Policy: Project Members - users can view members of projects they're in
CREATE POLICY "Users can view project members" ON public.project_members
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = (SELECT id FROM neon_auth.user WHERE email = current_user)
    )
  );

-- RLS Policy: Activity Logs - users can view logs from their projects
CREATE POLICY "Users can view activity logs" ON public.activity_logs
  FOR SELECT
  USING (
    project_id IN (
      SELECT projects.id FROM public.projects
      INNER JOIN public.project_members ON projects.id = project_members.project_id
      WHERE project_members.user_id = (SELECT id FROM neon_auth.user WHERE email = current_user)
    )
  );
