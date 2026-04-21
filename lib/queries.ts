import { getDb } from './db'

// Types
export interface Repository {
  id: string
  github_id: number
  name: string
  full_name: string
  description: string | null
  url: string
  default_branch: string
  language: string | null
  stars: number
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface RepoFile {
  id: string
  repository_id: string
  path: string
  name: string
  extension: string | null
  size_bytes: number | null
  file_type: string | null
  purpose: string | null
  technologies: string[]
  exports: string[]
  imports: string[]
  reusability_score: number
  ai_summary: string | null
  content_hash: string | null
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  name: string
  status: 'pending' | 'scanning' | 'analyzing' | 'complete' | 'failed'
  total_files: number
  analyzed_files: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface AppBlueprint {
  id: string
  analysis_id: string
  name: string
  description: string | null
  app_type: string | null
  complexity: 'simple' | 'moderate' | 'complex'
  reuse_percentage: number
  existing_files: { path: string; purpose: string }[]
  missing_files: { name: string; purpose: string }[]
  estimated_effort: string | null
  technologies: string[]
  ai_explanation: string | null
  created_at: string
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

export async function deleteRepository(id: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM repositories WHERE id = ${id}`
}

// File queries
export async function getFilesByRepository(repoId: string): Promise<RepoFile[]> {
  const sql = getDb()
  const files = await sql`SELECT * FROM repo_files WHERE repository_id = ${repoId} ORDER BY path`
  return files as RepoFile[]
}

export async function createRepoFile(data: {
  repository_id: string
  path: string
  name: string
  extension: string | null
  size_bytes: number | null
  file_type: string | null
}): Promise<RepoFile> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO repo_files (repository_id, path, name, extension, size_bytes, file_type)
    VALUES (${data.repository_id}, ${data.path}, ${data.name}, ${data.extension}, ${data.size_bytes}, ${data.file_type})
    ON CONFLICT (repository_id, path) DO UPDATE SET
      name = EXCLUDED.name,
      extension = EXCLUDED.extension,
      size_bytes = EXCLUDED.size_bytes,
      file_type = EXCLUDED.file_type,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0] as RepoFile
}

export async function updateFileAnalysis(id: string, data: {
  purpose?: string
  technologies?: string[]
  exports?: string[]
  imports?: string[]
  reusability_score?: number
  ai_summary?: string
}): Promise<RepoFile> {
  const sql = getDb()
  const result = await sql`
    UPDATE repo_files SET
      purpose = COALESCE(${data.purpose ?? null}, purpose),
      technologies = COALESCE(${JSON.stringify(data.technologies || [])}::jsonb, technologies),
      exports = COALESCE(${JSON.stringify(data.exports || [])}::jsonb, exports),
      imports = COALESCE(${JSON.stringify(data.imports || [])}::jsonb, imports),
      reusability_score = COALESCE(${data.reusability_score ?? null}, reusability_score),
      ai_summary = COALESCE(${data.ai_summary ?? null}, ai_summary),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as RepoFile
}

// Analysis queries
export async function getAllAnalyses(): Promise<Analysis[]> {
  const sql = getDb()
  const analyses = await sql`SELECT * FROM analyses ORDER BY created_at DESC`
  return analyses as Analysis[]
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

export async function createAnalysis(name: string): Promise<Analysis> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO analyses (name, status)
    VALUES (${name}, 'pending')
    RETURNING *
  `
  return result[0] as Analysis
}

export async function updateAnalysisStatus(id: string, status: Analysis['status'], data?: {
  total_files?: number
  analyzed_files?: number
  error_message?: string
}): Promise<Analysis> {
  const sql = getDb()
  const result = await sql`
    UPDATE analyses SET
      status = ${status},
      total_files = COALESCE(${data?.total_files ?? null}, total_files),
      analyzed_files = COALESCE(${data?.analyzed_files ?? null}, analyzed_files),
      error_message = ${data?.error_message ?? null},
      started_at = CASE WHEN ${status} = 'scanning' AND started_at IS NULL THEN CURRENT_TIMESTAMP ELSE started_at END,
      completed_at = CASE WHEN ${status} IN ('complete', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as Analysis
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

export async function getRepositoriesForAnalysis(analysisId: string): Promise<Repository[]> {
  const sql = getDb()
  const repos = await sql`
    SELECT r.* FROM repositories r
    JOIN analysis_repositories ar ON r.id = ar.repository_id
    WHERE ar.analysis_id = ${analysisId}
  `
  return repos as Repository[]
}

// Blueprint queries
export async function getBlueprintsByAnalysis(analysisId: string): Promise<AppBlueprint[]> {
  const sql = getDb()
  const blueprints = await sql`SELECT * FROM app_blueprints WHERE analysis_id = ${analysisId} ORDER BY reuse_percentage DESC`
  return blueprints as AppBlueprint[]
}

export async function deleteBlueprintsByAnalysis(analysisId: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM app_blueprints WHERE analysis_id = ${analysisId}`
}

export async function createBlueprint(data: {
  analysis_id: string
  name: string
  description: string | null
  app_type: string | null
  complexity: 'simple' | 'moderate' | 'complex'
  reuse_percentage: number
  existing_files: { path: string; purpose: string }[]
  missing_files: { name: string; purpose: string }[]
  estimated_effort: string | null
  technologies: string[]
  ai_explanation: string | null
}): Promise<AppBlueprint> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO app_blueprints (
      analysis_id, name, description, app_type, complexity, reuse_percentage,
      existing_files, missing_files, estimated_effort, technologies, ai_explanation
    )
    VALUES (
      ${data.analysis_id}, ${data.name}, ${data.description}, ${data.app_type}, ${data.complexity},
      ${data.reuse_percentage}, ${JSON.stringify(data.existing_files)}::jsonb, ${JSON.stringify(data.missing_files)}::jsonb,
      ${data.estimated_effort}, ${JSON.stringify(data.technologies)}::jsonb, ${data.ai_explanation}
    )
    RETURNING *
  `
  return result[0] as AppBlueprint
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
