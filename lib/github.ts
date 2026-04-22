import jwt from 'jsonwebtoken'

export interface GitHubRepositorySummary {
  id: number
  name: string
  full_name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  default_branch: string
  private: boolean
}

interface GitHubApiRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  default_branch: string
  private: boolean
}

async function githubRequest<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeVault',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`GitHub request failed (${response.status}): ${message}`)
  }

  return response.json() as Promise<T>
}

export async function listGitHubRepositories(accessToken: string): Promise<GitHubRepositorySummary[]> {
  const repositories: GitHubRepositorySummary[] = []

  for (let page = 1; page <= 5; page += 1) {
    const pageItems = await githubRequest<GitHubApiRepository[]>(
      `https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member&page=${page}`,
      accessToken,
    )

    repositories.push(
      ...pageItems.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        default_branch: repo.default_branch,
        private: repo.private,
      })),
    )

    if (pageItems.length < 100) {
      break
    }
  }

  return repositories
}

export async function getGitHubRepositoryTree(
  fullName: string,
  defaultBranch: string,
  accessToken: string,
) {
  return githubRequest<{ tree?: Array<{ path: string; type: string; size?: number }> }>(
    `https://api.github.com/repos/${fullName}/git/trees/${defaultBranch}?recursive=1`,
    accessToken,
  )
}

// ============================================================================
// GitHub App Authentication (JWT-based)
// ============================================================================

interface GitHubAppTokenResponse {
  token: string
  expires_at: string
}

/**
 * Generate a JWT signed with the GitHub App's private key
 * JWT is used to authenticate as the app itself to GitHub API
 */
function generateGitHubAppJWT(): string {
  const appId = process.env.GITHUB_APP_ID
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!appId || !privateKey) {
    throw new Error('Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY environment variables')
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now,
    exp: now + 600, // 10 minute expiration (GitHub requirement)
    iss: appId,
  }

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}

/**
 * Exchange GitHub App JWT for an installation access token
 * This token is used to make API calls on behalf of a specific installation
 */
export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const appJwt = generateGitHubAppJWT()

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'CodeVault',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('[v0] Failed to get installation token:', error)
    throw new Error(`Failed to get installation access token: ${response.statusText}`)
  }

  const data = (await response.json()) as GitHubAppTokenResponse
  return data.token
}

/**
 * Make a GitHub API call using an installation access token
 */
export async function makeGitHubAppApiCall<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  installationId: number,
  body?: Record<string, unknown>
): Promise<T> {
  const token = await getInstallationAccessToken(installationId)

  const url = endpoint.startsWith('https') ? endpoint : `https://api.github.com${endpoint}`

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CodeVault',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[v0] GitHub API error (${method} ${endpoint}):`, error)
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return (await response.json()) as T
}

/**
 * Get user profile info from GitHub using installation token
 */
export async function getUserProfileFromApp(
  installationId: number
): Promise<{ login: string; id: number; avatar_url: string; type: string }> {
  return makeGitHubAppApiCall('GET', '/user', installationId)
}
