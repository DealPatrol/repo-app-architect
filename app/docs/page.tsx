export const metadata = {
  title: "API – Repo Architect",
  description: "Public API documentation for Repo Architect",
};

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-[var(--accent)] hover:underline text-sm">
            ← Back to Repo Architect
          </a>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Repo Architect API</h1>
        <p className="text-[var(--text-muted)] mb-10">
          Call Repo Architect endpoints from scripts or external tools. Requires authentication (sign in with GitHub).
        </p>

        <section className="space-y-8">
          <ApiEndpoint
            method="POST"
            path="/api/analyze-repo"
            title="Analyze repository"
            description="Get AI analysis of a GitHub repo: summary, tech stack, capabilities, architecture."
            body={{
              owner: "string (required)",
              repo: "string (required)",
            }}
            example={`fetch("${BASE}/api/analyze-repo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ owner: "vercel", repo: "next.js" }),
});`}
          />

          <ApiEndpoint
            method="POST"
            path="/api/discover-projects"
            title="Discover projects"
            description="Scan your repos and get AI-suggested projects you can build from existing files."
            body={{
              limit: "number (optional, default 25)",
              projectCount: "number (optional, default 5)",
              excludeForks: "boolean (optional)",
              excludeArchived: "boolean (optional)",
            }}
            example={`fetch("${BASE}/api/discover-projects", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ limit: 20, projectCount: 10 }),
});`}
          />

          <ApiEndpoint
            method="POST"
            path="/api/find-files-for-project"
            title="Find reusable files"
            description="Describe a project; get grouped directions with existing and missing files."
            body={{
              projectDescription: "string (required)",
              limit: "number (optional)",
              excludeForks: "boolean (optional)",
              excludeArchived: "boolean (optional)",
            }}
            example={`fetch("${BASE}/api/find-files-for-project", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ projectDescription: "A Next.js dashboard with auth" }),
});`}
          />

          <ApiEndpoint
            method="POST"
            path="/api/copy-to-repo"
            title="Copy files to new repo"
            description="Create a new GitHub repo and copy specified files into it."
            body={{
              newRepoName: "string (required)",
              files: "string[] (required, e.g. owner/repo/path)",
              description: "string (optional)",
            }}
            example={`fetch("${BASE}/api/copy-to-repo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    newRepoName: "my-app",
    files: ["owner/repo/src/utils.ts", "owner/repo/package.json"],
  }),
});`}
          />

          <ApiEndpoint
            method="POST"
            path="/api/share-blueprint"
            title="Share blueprint"
            description="Create a shareable link for analysis, discover, or find-files results."
            body={{
              title: "string (required)",
              type: "string (required: analysis | discover | findFiles)",
              data: "object (required, the payload to share)",
            }}
            example={`fetch("${BASE}/api/share-blueprint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ title: "My Blueprint", type: "analysis", data: analysis }),
});`}
          />
        </section>

        <ApiEndpoint
          method="POST"
          path="/api/file-dependencies"
          title="File dependencies"
          description="Extract imports from selected files (JS/TS). Returns path and imports for each file."
          body={{ files: "string[] (required, owner/repo/path format)" }}
          example={`fetch("${BASE}/api/file-dependencies", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ files: ["owner/repo/src/utils.ts"] }),
});`}
        />

        <ApiEndpoint
          method="POST"
          path="/api/preview-files"
          title="Preview files"
          description="Fetch file contents from GitHub for diff preview before copy."
          body={{ files: "string[] (required, 1-30 items)" }}
          example={`fetch("${BASE}/api/preview-files", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ files: ["owner/repo/src/utils.ts"] }),
});`}
        />

        <section className="mt-12 p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <h2 className="text-lg font-semibold mb-2">Authentication</h2>
          <p className="text-[var(--text-muted)] text-sm">
            All endpoints require a signed-in GitHub session. Use <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent)]">credentials: &quot;include&quot;</code> so the session cookie is sent with each request.
          </p>
        </section>
      </div>
    </div>
  );
}

function ApiEndpoint({
  method,
  path,
  title,
  description,
  body,
  example,
}: {
  method: string;
  path: string;
  title: string;
  description: string;
  body: Record<string, string>;
  example: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
            method === "POST" ? "bg-[var(--accent-muted)] text-[var(--accent)]" : "bg-[var(--bg-elevated)]"
          }`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-[var(--text-muted)]">{path}</code>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm mb-4">{description}</p>
      <div className="mb-4">
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Request body</h4>
        <pre className="text-xs font-mono text-[var(--text-subtle)] bg-[var(--bg-elevated)] p-3 rounded-lg overflow-x-auto">
          {JSON.stringify(body, null, 2)}
        </pre>
      </div>
      <div>
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Example</h4>
        <pre className="text-xs font-mono text-[var(--text-subtle)] bg-[var(--bg-elevated)] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
          {example}
        </pre>
      </div>
    </div>
  );
}
