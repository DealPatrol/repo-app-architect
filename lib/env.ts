/**
 * Environment validation for production readiness.
 * Logs warnings in development; use in API routes to fail fast in production.
 */

const required = [
  "OPENAI_API_KEY",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

const requiredForOAuth = ["GITHUB_ID", "GITHUB_SECRET"] as const;
const requiredForShare = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function isConfigured(key: string): boolean {
  const val = process.env[key];
  return !!val && !val.includes("your_") && !/ghp_your|ghp_xxxx|replace_me|sk-your/i.test(val);
}

export function validateEnv(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of required) {
    if (!isConfigured(key)) missing.push(key);
  }

  // OAuth: optional but recommended for Discover/Find Files/Copy
  if (!isConfigured("GITHUB_ID") || !isConfigured("GITHUB_SECRET")) {
    if (process.env.NODE_ENV === "production") {
      missing.push("GITHUB_ID and GITHUB_SECRET (required for OAuth)");
    }
  }

  return { ok: missing.length === 0, missing };
}

export function getEnvStatus() {
  return {
    openai: isConfigured("OPENAI_API_KEY"),
    auth: isConfigured("NEXTAUTH_SECRET") && isConfigured("NEXTAUTH_URL"),
    oauth: requiredForOAuth.every(isConfigured),
    share: requiredForShare.every(isConfigured),
    githubToken: isConfigured("GITHUB_TOKEN"),
  };
}
