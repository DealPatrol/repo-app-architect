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
