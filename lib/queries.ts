import { sql } from './db';

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  slug: string;
  status: 'active' | 'archived' | 'deleted';
  visibility: 'private' | 'public';
  color: string;
  icon: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  added_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  company_name: string | null;
  job_title: string | null;
  timezone: string;
  billing_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Project queries
export async function getProjectsByOrganization(orgId: string): Promise<Project[]> {
  const projects = await sql('SELECT * FROM projects WHERE organization_id = $1 AND status != $2 ORDER BY created_at DESC', [
    orgId,
    'deleted',
  ]);
  return projects as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const projects = await sql('SELECT * FROM projects WHERE id = $1', [projectId]);
  return (projects[0] as Project) || null;
}

export async function createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const result = await sql(
    `INSERT INTO projects (organization_id, name, description, slug, status, visibility, color, icon, created_by) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     RETURNING *`,
    [data.organization_id, data.name, data.description, data.slug, data.status, data.visibility, data.color, data.icon, data.created_by]
  );
  return result[0] as Project;
}

// Task queries
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const tasks = await sql('SELECT * FROM tasks WHERE project_id = $1 ORDER BY order_index ASC, created_at DESC', [projectId]);
  return tasks as Task[];
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const tasks = await sql('SELECT * FROM tasks WHERE id = $1', [taskId]);
  return (tasks[0] as Task) || null;
}

export async function createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const result = await sql(
    `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.project_id,
      data.title,
      data.description,
      data.status,
      data.priority,
      data.assigned_to,
      data.created_by,
      data.due_date,
      data.order_index,
    ]
  );
  return result[0] as Task;
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at') {
      updates.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  if (updates.length === 0) {
    const existing = await getTaskById(taskId);
    if (!existing) {
      throw new Error('Task not found');
    }
    return existing;
  }

  values.push(taskId);
  const result = await sql(`UPDATE tasks SET updated_at = CURRENT_TIMESTAMP, ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
  return result[0] as Task;
}

// Task comments
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const comments = await sql('SELECT * FROM task_comments WHERE task_id = $1 ORDER BY created_at DESC', [taskId]);
  return comments as TaskComment[];
}

export async function createTaskComment(data: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>): Promise<TaskComment> {
  const result = await sql(
    'INSERT INTO task_comments (task_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
    [data.task_id, data.author_id, data.content]
  );
  return result[0] as TaskComment;
}

// Project members
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const members = await sql(
    `SELECT
      pm.id,
      pm.project_id,
      pm.user_id,
      pm.role,
      pm.added_at,
      u.name as name,
      u.email as email
    FROM project_members pm
    LEFT JOIN neon_auth."user" u ON u.id = pm.user_id
    WHERE pm.project_id = $1
    ORDER BY pm.added_at DESC`,
    [projectId]
  );
  return members as ProjectMember[];
}

export async function addProjectMember(data: Omit<ProjectMember, 'id' | 'added_at'>): Promise<ProjectMember> {
  const result = await sql(
    'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
    [data.project_id, data.user_id, data.role]
  );
  return result[0] as ProjectMember;
}

// Activity logs
export async function logActivity(data: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
  const result = await sql(
    `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, description, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.project_id, data.user_id, data.action, data.entity_type, data.entity_id, data.description, data.metadata ? JSON.stringify(data.metadata) : null]
  );
  return result[0] as ActivityLog;
}

// User profile queries
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profiles = await sql('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
  return (profiles[0] as UserProfile) || null;
}

export async function upsertUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile> {
  const result = await sql(
    `INSERT INTO user_profiles (user_id, display_name, company_name, job_title, timezone, billing_email)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT(user_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       company_name = EXCLUDED.company_name,
       job_title = EXCLUDED.job_title,
       timezone = EXCLUDED.timezone,
       billing_email = EXCLUDED.billing_email,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      data.display_name ?? null,
      data.company_name ?? null,
      data.job_title ?? null,
      data.timezone ?? 'UTC',
      data.billing_email ?? null,
    ]
  );

  return result[0] as UserProfile;
}

// Subscription queries
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const subscriptions = await sql('SELECT * FROM user_subscriptions WHERE user_id = $1', [userId]);
  return (subscriptions[0] as UserSubscription) || null;
}

export async function getUserSubscriptionByCustomerId(
  customerId: string
): Promise<UserSubscription | null> {
  const subscriptions = await sql(
    'SELECT * FROM user_subscriptions WHERE stripe_customer_id = $1',
    [customerId]
  );
  return (subscriptions[0] as UserSubscription) || null;
}

export async function upsertUserSubscription(
  userId: string,
  data: Partial<Omit<UserSubscription, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSubscription> {
  const result = await sql(
    `INSERT INTO user_subscriptions (
      user_id, stripe_customer_id, stripe_subscription_id, status, plan, current_period_end, cancel_at_period_end
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT(user_id) DO UPDATE SET
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id,
       status = EXCLUDED.status,
       plan = EXCLUDED.plan,
       current_period_end = EXCLUDED.current_period_end,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      data.stripe_customer_id ?? null,
      data.stripe_subscription_id ?? null,
      data.status ?? 'inactive',
      data.plan ?? 'free',
      data.current_period_end ?? null,
      data.cancel_at_period_end ?? false,
    ]
  );

  return result[0] as UserSubscription;
}

export async function updateUserSubscriptionByCustomerId(
  customerId: string,
  data: Partial<Omit<UserSubscription, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSubscription | null> {
  const result = await sql(
    `UPDATE user_subscriptions
     SET
       stripe_subscription_id = COALESCE($2, stripe_subscription_id),
       status = COALESCE($3, status),
       plan = COALESCE($4, plan),
       current_period_end = COALESCE($5, current_period_end),
       cancel_at_period_end = COALESCE($6, cancel_at_period_end),
       updated_at = CURRENT_TIMESTAMP
     WHERE stripe_customer_id = $1
     RETURNING *`,
    [
      customerId,
      data.stripe_subscription_id ?? null,
      data.status ?? null,
      data.plan ?? null,
      data.current_period_end ?? null,
      data.cancel_at_period_end ?? null,
    ]
  );

  return (result[0] as UserSubscription) || null;
}
