import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { fetchRepoFileTree, fetchUserRepos } from "@/lib/github";
import { getGitHubToken } from "@/lib/get-github-token";

const projectSchema = z.object({
  potentialProjects: z.array(
    z.object({
      name: z.string().describe("Suggested project/application name"),
      description: z.string().describe("What the application does"),
      existingFiles: z
        .array(z.string())
        .describe("Files from repos to reuse; format owner/repo/path/to/file"),
      missingFiles: z
        .array(z.string())
        .describe("Specific files to create for completion (exact file paths)"),
      completenessNote: z
        .string()
        .describe("Brief status note like 'Almost complete, needs 2 files'"),
    })
  ),
});

export type DiscoveredProject = z.infer<typeof projectSchema>["potentialProjects"][0];

export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    if (!token) {
      return NextResponse.json({ error: "Missing GitHub token configuration" }, { status: 503 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenAI API key configuration" }, { status: 503 });
    }

    let options = { limit: 40, excludeForks: true, excludeArchived: true, projectCount: 5 };
    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body === "object" && body !== null) {
        if (typeof body.limit === "number") options.limit = Math.min(100, Math.max(5, body.limit));
        if (typeof body.excludeForks === "boolean") options.excludeForks = body.excludeForks;
        if (typeof body.excludeArchived === "boolean") options.excludeArchived = body.excludeArchived;
        if (typeof body.projectCount === "number") {
          options.projectCount = Math.min(20, Math.max(3, body.projectCount));
        }
      }
    } catch {
      // Keep defaults when body isn't provided.
    }

    const repos = await fetchUserRepos(token, options);
    if (repos.length === 0) {
      return NextResponse.json({ error: "No repositories found for this account" }, { status: 404 });
    }

    const repoFileMap: Record<string, { description: string; files: string[] }> = {};
    for (const repo of repos) {
      const files = await fetchRepoFileTree(repo.full_name, repo.default_branch, token);
      repoFileMap[repo.full_name] = { description: repo.description, files };
    }

    const context = Object.entries(repoFileMap)
      .map(([repoName, { description, files }]) => {
        const fileList = files.slice(0, 300).join("\n  - ");
        return `## ${repoName}${description ? `\n${description}` : ""}\nFiles:\n  - ${fileList}${files.length > 300 ? `\n  ... and ${files.length - 300} more` : ""}`;
      })
      .join("\n\n");

    const prompt = `You are analyzing a developer's repositories to discover realistic project opportunities.

Requirements:
1) Return exactly ${options.projectCount} projects.
2) Prioritize "almost-complete" opportunities where existing code can be reused.
3) For each project include:
   - name
   - description
   - completenessNote (clear maturity note)
   - existingFiles (real owner/repo/path from input)
   - missingFiles (specific file paths to create)
4) Keep project names specific and practical.
5) existingFiles should contain 4-8 concrete file paths when possible.
6) missingFiles should usually contain 1-4 high-impact files.

Output format must be valid JSON with this exact shape:
{ "potentialProjects": [ { "name": string, "description": string, "existingFiles": string[], "missingFiles": string[], "completenessNote": string } ] }

---REPOSITORIES---
${context}
---END---`;

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = projectSchema.parse(JSON.parse(content));
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
