import 'server-only';

const CODE_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'py',
  'go',
  'rs',
  'java',
  'rb',
  'php',
  'vue',
  'svelte',
  'css',
  'scss',
  'html',
  'json',
  'md',
  'yml',
  'yaml',
  'sql',
]);

const SKIP_PATH_PARTS = [
  'node_modules/',
  '.git/',
  '.next/',
  'dist/',
  'build/',
  'coverage/',
  'vendor/',
  'tmp/',
  'temp/',
  '__pycache__/',
];

const MAX_FILES_PER_REPO = 250;

type ParsedRepo = {
  owner: string;
  repo: string;
  fullName: string;
};

type RepoFileCollection = {
  repositories: Array<{
    input: string;
    fullName: string;
    defaultBranch: string;
    fileCount: number;
  }>;
  files: string[];
  errors: string[];
};

function parseRepositoryIdentifier(input: string): ParsedRepo | null {
  const value = input.trim().replace(/\.git$/i, '');
  if (!value) return null;

  const githubUrlMatch = value.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+?)(?:\/.*)?$/i
  );
  if (githubUrlMatch) {
    const [, owner, repo] = githubUrlMatch;
    return { owner, repo, fullName: `${owner}/${repo}` };
  }

  const shorthandMatch = value.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shorthandMatch) {
    const [, owner, repo] = shorthandMatch;
    return { owner, repo, fullName: `${owner}/${repo}` };
  }

  return null;
}

function shouldSkipRepoPath(path: string) {
  return SKIP_PATH_PARTS.some((part) => path.includes(part));
}

function isCodeFile(path: string) {
  if (shouldSkipRepoPath(path)) return false;
  const extension = path.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  return CODE_EXTENSIONS.has(extension);
}

async function githubRequest<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TaskFlow-Blueprint-Generator',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`GitHub API ${response.status}: ${detail || response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function collectRepositoryFiles(
  repositoryInputs: string[],
  token?: string
): Promise<RepoFileCollection> {
  const dedupedInputs = [...new Set(repositoryInputs.map((item) => item.trim()).filter(Boolean))];
  const repositories: RepoFileCollection['repositories'] = [];
  const files: string[] = [];
  const errors: string[] = [];

  for (const input of dedupedInputs) {
    const parsed = parseRepositoryIdentifier(input);
    if (!parsed) {
      errors.push(`Invalid repository identifier: "${input}"`);
      continue;
    }

    try {
      const repoMeta = await githubRequest<{ default_branch: string }>(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
        token
      );
      const defaultBranch = repoMeta.default_branch || 'main';

      const treeData = await githubRequest<{
        truncated?: boolean;
        tree: Array<{ path: string; type: string }>;
      }>(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(
          defaultBranch
        )}?recursive=1`,
        token
      );

      const repoFiles = (treeData.tree || [])
        .filter((item) => item.type === 'blob')
        .map((item) => item.path)
        .filter(isCodeFile)
        .slice(0, MAX_FILES_PER_REPO)
        .map((path) => `${parsed.fullName}:${path}`);

      repositories.push({
        input,
        fullName: parsed.fullName,
        defaultBranch,
        fileCount: repoFiles.length,
      });
      files.push(...repoFiles);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GitHub error';
      errors.push(`Failed to read "${parsed.fullName}": ${message}`);
    }
  }

  return {
    repositories,
    files: [...new Set(files)],
    errors,
  };
}
