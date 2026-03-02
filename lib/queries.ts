import { getDb } from './db'

export interface Project {
  id: string
  organization_id: string
  name: string
  description: string | null
  slug: string
  status: 'active' | 'archived' | 'deleted'
  visibility: 'private' | 'public'
  color: string
  icon: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_by: string
  due_date: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface TaskAttachment {
  id: string
  task_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  added_at: string
}

export interface ActivityLog {
  id: string
  project_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Project queries
export async function getAllProjects(): Promise<Project[]> {
  const sql = getDb()
  const projects = await sql`SELECT * FROM projects WHERE status != 'deleted' ORDER BY created_at DESC`
  return projects as Project[]
}

export async function getProjectsByOrganization(orgId: string): Promise<Project[]> {
  const sql = getDb()
  const projects = await sql`SELECT * FROM projects WHERE organization_id = ${orgId} AND status != 'deleted' ORDER BY created_at DESC`
  return projects as Project[]
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const sql = getDb()
  const projects = await sql`SELECT * FROM projects WHERE id = ${projectId}`
  return (projects[0] as Project) || null
}

export async function createProject(data: {
  name: string
  description: string | null
  slug: string
  status: string
  visibility: string
  color: string
  icon: string | null
}): Promise<Project> {
  const sql = getDb()
  // Create project without organization_id and created_by constraints for demo mode
  const result = await sql`
    INSERT INTO projects (name, description, slug, status, visibility, color, icon) 
    VALUES (${data.name}, ${data.description}, ${data.slug}, ${data.status}, ${data.visibility}, ${data.color}, ${data.icon}) 
    RETURNING *
  `
  return result[0] as Project
}

// Task queries
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const sql = getDb()
  const tasks = await sql`SELECT * FROM tasks WHERE project_id = ${projectId} ORDER BY order_index ASC, created_at DESC`
  return tasks as Task[]
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const sql = getDb()
  const tasks = await sql`SELECT * FROM tasks WHERE id = ${taskId}`
  return (tasks[0] as Task) || null
}

export async function createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, order_index)
    VALUES (${data.project_id}, ${data.title}, ${data.description}, ${data.status}, ${data.priority}, ${data.assigned_to}, ${data.created_by}, ${data.due_date}, ${data.order_index})
    RETURNING *
  `
  return result[0] as Task
}

export async function updateTask(taskId: string, status: string): Promise<Task> {
  const sql = getDb()
  const result = await sql`UPDATE tasks SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${taskId} RETURNING *`
  return result[0] as Task
}

// Task comments
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const sql = getDb()
  const comments = await sql`SELECT * FROM task_comments WHERE task_id = ${taskId} ORDER BY created_at DESC`
  return comments as TaskComment[]
}

export async function createTaskComment(data: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>): Promise<TaskComment> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO task_comments (task_id, author_id, content) VALUES (${data.task_id}, ${data.author_id}, ${data.content}) RETURNING *
  `
  return result[0] as TaskComment
}

// Project members
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const sql = getDb()
  const members = await sql`SELECT * FROM project_members WHERE project_id = ${projectId}`
  return members as ProjectMember[]
}

export async function addProjectMember(data: Omit<ProjectMember, 'id' | 'added_at'>): Promise<ProjectMember> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO project_members (project_id, user_id, role) VALUES (${data.project_id}, ${data.user_id}, ${data.role}) RETURNING *
  `
  return result[0] as ProjectMember
}

// Activity logs
export async function getActivityLogs(projectId: string, limit = 20): Promise<ActivityLog[]> {
  const sql = getDb()
  const logs = await sql`SELECT * FROM activity_logs WHERE project_id = ${projectId} ORDER BY created_at DESC LIMIT ${limit}`
  return logs as ActivityLog[]
}

export async function logActivity(data: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, description, metadata)
    VALUES (${data.project_id}, ${data.user_id}, ${data.action}, ${data.entity_type}, ${data.entity_id}, ${data.description}, ${data.metadata ? JSON.stringify(data.metadata) : null})
    RETURNING *
  `
  return result[0] as ActivityLog
}
