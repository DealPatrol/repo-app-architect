export function ghHeaders(token: string) {
  return {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "repo-app-architect",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchUserRepos(
  token: string,
  options: { limit?: number; excludeForks?: boolean; excludeArchived?: boolean }
): Promise<{ full_name: string; default_branch: string; description: string }[]> {
  const { limit = 40, excludeForks = true, excludeArchived = true } = options;
  const repos: { full_name: string; default_branch: string; description: string }[] = [];
  let page = 1;
  const perPage = 30;

  while (repos.length < limit) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner`,
      { headers: ghHeaders(token), cache: "no-store" }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `GitHub API error: ${res.status}`);
    }

    const batch = (await res.json()) as Array<{
      full_name: string;
      default_branch?: string;
      description?: string;
      fork?: boolean;
      archived?: boolean;
    }>;

    if (batch.length === 0) break;

    for (const repo of batch) {
      if (repos.length >= limit) break;
      if (excludeForks && repo.fork) continue;
      if (excludeArchived && repo.archived) continue;
      repos.push({
        full_name: repo.full_name,
        default_branch: repo.default_branch || "main",
        description: repo.description || "",
      });
    }

    if (batch.length < perPage) break;
    page++;
  }

  return repos;
}

export async function fetchRepoFileTree(
  fullName: string,
  _defaultBranch: string,
  token: string
): Promise<string[]> {
  const [owner, repo] = fullName.split("/");
  const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
    headers: ghHeaders(token),
    cache: "no-store",
  });
  if (!commitsRes.ok) return [];

  const commits = (await commitsRes.json()) as Array<{ commit?: { tree?: { sha?: string } } }>;
  const treeSha = commits[0]?.commit?.tree?.sha;
  if (!treeSha) return [];

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
    { headers: ghHeaders(token), cache: "no-store" }
  );
  if (!treeRes.ok) return [];

  const tree = (await treeRes.json()) as { tree?: Array<{ type?: string; path?: string }> };
  return (
    tree.tree
      ?.filter((node) => node.type === "blob")
      ?.map((node) => node.path || "")
      ?.filter(Boolean) ?? []
  );
}
