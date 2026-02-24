/** Input validation for API routes */

const MAX_OWNER_LENGTH = 100;
const MAX_REPO_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const GITHUB_NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export function validateOwnerRepo(owner: unknown, repo: unknown): { ok: true; owner: string; repo: string } | { ok: false; error: string } {
  if (typeof owner !== "string" || typeof repo !== "string") {
    return { ok: false, error: "Invalid owner or repo" };
  }
  const o = owner.trim().slice(0, MAX_OWNER_LENGTH);
  const r = repo.trim().slice(0, MAX_REPO_LENGTH);
  if (!o || !r) return { ok: false, error: "Missing owner or repo" };
  if (!GITHUB_NAME_REGEX.test(o) || !GITHUB_NAME_REGEX.test(r)) {
    return { ok: false, error: "Owner and repo must contain only letters, numbers, dots, hyphens, and underscores" };
  }
  return { ok: true, owner: o, repo: r };
}

export function validateProjectDescription(desc: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof desc !== "string") return { ok: false, error: "Invalid description" };
  const v = desc.trim().slice(0, MAX_DESCRIPTION_LENGTH);
  if (!v) return { ok: false, error: "Description is required" };
  return { ok: true, value: v };
}
