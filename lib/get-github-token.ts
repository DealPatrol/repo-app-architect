/** Prefer runtime env token for server-side discovery jobs. */
export async function getGitHubToken(): Promise<string> {
  return process.env.GITHUB_TOKEN ?? "";
}
