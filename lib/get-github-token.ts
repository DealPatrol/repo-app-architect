import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/** Get GitHub token from session (OAuth) or fall back to env GITHUB_TOKEN */
export async function getGitHubToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (token) return token;
  return process.env.GITHUB_TOKEN ?? "";
}
