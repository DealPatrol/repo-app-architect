import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getGitHubToken } from "@/lib/get-github-token";
import { validateOwnerRepo } from "@/lib/validation";

const migrationSuggestionSchema = z.object({
  from: z.string().describe("Current state (e.g. JavaScript, React 17)"),
  to: z.string().describe("Target state (e.g. TypeScript, React 18)"),
  reason: z.string().describe("Why this migration is recommended"),
  steps: z.array(z.string()).describe("2-4 actionable steps to perform the migration"),
});

const analysisSchema = z.object({
  summary: z.string().describe("A 2-4 paragraph summary of what the repo does, its purpose, and main characteristics"),
  techStack: z.array(z.string()).describe("Detected technologies: frameworks, languages, databases, tools"),
  architecture: z.string().describe("Architecture overview: folder structure, entry points, how modules connect"),
  dependencies: z.array(z.string()).describe("Key dependencies and what they're used for (from package.json or similar)"),
  capabilities: z.array(z.string()).describe("List of key capabilities, features, or technical abilities"),
  appConcepts: z.array(z.string()).describe("High-level application concepts, architecture patterns, or design ideas"),
  suggestedImprovements: z.array(z.string()).optional().describe("Suggestions for improvement, tech debt, or modernization"),
  migrationSuggestions: z.array(migrationSuggestionSchema).optional().describe("Structured migration suggestions: JS→TS, framework upgrades, deprecated deps, etc."),
});

export type RepoAnalysis = z.infer<typeof analysisSchema>;

async function fetchRepoData(owner: string, repo: string, token: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "repo-app-architect",
  };
  if (token && !token.includes("your_")) {
    headers.Authorization = `Bearer ${token}`;
  }

  const [repoRes, readmeRes, contentsRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }).catch(() => null),
    fetch(`https://api.github.com/repos/${owner}/${repo}/contents?per_page=100`, { headers }).catch(() => null),
  ]);

  if (!repoRes.ok) {
    const err = await repoRes.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${repoRes.status}`);
  }

  const repoData = await repoRes.json();
  let readmeContent = "";
  let rootFiles: string[] = [];

  if (readmeRes?.ok) {
    const readmeData = await readmeRes.json();
    readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
  }

  if (contentsRes?.ok) {
    const contents = await contentsRes.json();
    rootFiles = Array.isArray(contents) ? contents.map((c: { name: string }) => c.name) : [];
  }

  // Try to fetch package.json for more context
  let packageJson = "";
  if (rootFiles.includes("package.json")) {
    try {
      const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers });
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        packageJson = Buffer.from(pkgData.content, "base64").toString("utf-8");
      }
    } catch {
      // ignore
    }
  }

  return {
    name: repoData.full_name,
    description: repoData.description || "",
    language: repoData.language || "",
    topics: (repoData.topics || []).join(", "),
    readme: readmeContent.slice(0, 12000),
    rootFiles: rootFiles.join(", "),
    packageJson: packageJson.slice(0, 4000),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = validateOwnerRepo(body?.owner, body?.repo);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { owner, repo } = validated;

    const token = await getGitHubToken();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes("your-")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const repoData = await fetchRepoData(owner, repo, token);
    const openai = new OpenAI({ apiKey });

    const prompt = `Analyze this GitHub repository and provide a structured analysis.

Repository: ${repoData.name}
Description: ${repoData.description}
Primary language: ${repoData.language}
Topics: ${repoData.topics}
Root files: ${repoData.rootFiles}

${repoData.readme ? `README content:\n${repoData.readme}` : ""}

${repoData.packageJson ? `package.json:\n${repoData.packageJson}` : ""}

Provide:
1. summary: A 2-4 paragraph summary of what the repo does, its purpose, tech stack, and main characteristics.
2. techStack: Array of detected technologies (frameworks, languages, databases, tools).
3. architecture: Overview of the architecture - folder structure, entry points, how modules connect, data flow.
4. dependencies: Key dependencies from package.json and what each is used for.
5. capabilities: A list of 5-15 key capabilities, features, or technical abilities.
6. appConcepts: High-level application concepts, architecture patterns, or design ideas.
7. suggestedImprovements: 2-5 optional suggestions for improvement, tech debt, or modernization.
8. migrationSuggestions: 2-5 structured migration suggestions. Include: from (current state), to (target), reason (why), steps (2-4 actionable steps). Examples: JavaScript→TypeScript, React 17→18, deprecated dependencies, CommonJS→ESM.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nRespond with valid JSON: { "summary": string, "techStack": string[], "architecture": string, "dependencies": string[], "capabilities": string[], "appConcepts": string[], "suggestedImprovements": string[], "migrationSuggestions": [{ "from": string, "to": string, "reason": string, "steps": string[] }] }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = analysisSchema.parse(JSON.parse(content));
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
