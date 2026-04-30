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
  ai_provider: string | null
  created_at: string
}

// Repository queries
export async function getAllRepositories(): Promise<Repository[]> {
  const sql = getDb()
  const repos = await sql<Repository[]>`SELECT * FROM repositories ORDER BY created_at DESC`
  return repos
}

export async function getRepositoryById(id: string): Promise<Repository | null> {
  const sql = getDb()
  const repos = await sql`SELECT * FROM repositories WHERE id = ${id}`
  return repos[0] as Repository || null
}

export async function createRepository(data: {
  github_id: number
  name: string
  full_name: string
  description: string | null
  url: string
  default_branch: string
  language: string | null
  stars: number
}): Promise<Repository> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO repositories (github_id, name, full_name, description, url, default_branch, language, stars)
    VALUES (${data.github_id}, ${data.name}, ${data.full_name}, ${data.description}, ${data.url}, ${data.default_branch}, ${data.language}, ${data.stars})
    ON CONFLICT (github_id) DO UPDATE SET
      name = EXCLUDED.name,
      full_name = EXCLUDED.full_name,
      description = EXCLUDED.description,
      url = EXCLUDED.url,
      default_branch = EXCLUDED.default_branch,
      language = EXCLUDED.language,
      stars = EXCLUDED.stars,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0] as Repository
}

export async function deleteRepository(id: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM repositories WHERE id = ${id}`
}

// File queries
export async function getFilesByRepository(repoId: string): Promise<RepoFile[]> {
  const sql = getDb()
  const files = await sql<RepoFile[]>`SELECT * FROM repo_files WHERE repository_id = ${repoId} ORDER BY path`
  return files
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
  const analyses = await sql<Analysis[]>`SELECT * FROM analyses ORDER BY created_at DESC`
  return analyses
}

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const sql = getDb()
  const analyses = await sql`SELECT * FROM analyses WHERE id = ${id}`
  return analyses[0] as Analysis || null
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

export async function linkAnalysisToRepository(analysisId: string, repositoryId: string): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO analysis_repositories (analysis_id, repository_id)
    VALUES (${analysisId}, ${repositoryId})
    ON CONFLICT DO NOTHING
  `
}

export async function getRepositoriesForAnalysis(analysisId: string): Promise<Repository[]> {
  const sql = getDb()
  const repos = await sql<Repository[]>`
    SELECT r.* FROM repositories r
    JOIN analysis_repositories ar ON r.id = ar.repository_id
    WHERE ar.analysis_id = ${analysisId}
  `
  return repos
}

// Blueprint queries
export async function getBlueprintsByAnalysis(analysisId: string): Promise<AppBlueprint[]> {
  const sql = getDb()
  const blueprints = await sql<AppBlueprint[]>`SELECT * FROM app_blueprints WHERE analysis_id = ${analysisId} ORDER BY reuse_percentage DESC`
  return blueprints
}

export async function deleteBlueprintsByAnalysis(analysisId: string, provider?: string): Promise<void> {
  const sql = getDb()
  if (provider) {
    await sql`DELETE FROM app_blueprints WHERE analysis_id = ${analysisId} AND ai_provider = ${provider}`
  } else {
    await sql`DELETE FROM app_blueprints WHERE analysis_id = ${analysisId}`
  }
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
  ai_provider?: string | null
}): Promise<AppBlueprint> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO app_blueprints (
      analysis_id, name, description, app_type, complexity, reuse_percentage,
      existing_files, missing_files, estimated_effort, technologies, ai_explanation, ai_provider
    )
    VALUES (
      ${data.analysis_id}, ${data.name}, ${data.description}, ${data.app_type}, ${data.complexity},
      ${data.reuse_percentage}, ${JSON.stringify(data.existing_files)}::jsonb, ${JSON.stringify(data.missing_files)}::jsonb,
      ${data.estimated_effort}, ${JSON.stringify(data.technologies)}::jsonb, ${data.ai_explanation},
      ${data.ai_provider ?? 'anthropic'}
    )
    RETURNING *
  `
  return result[0] as AppBlueprint
}
