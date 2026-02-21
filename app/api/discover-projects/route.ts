import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { fetchUserRepos, fetchRepoFileTree } from "@/lib/github";
import { getGitHubToken } from "@/lib/get-github-token";

const projectSchema = z.object({
  potentialProjects: z.array(
    z.object({
      name: z.string().describe("Suggested project/application name"),
      description: z.string().describe("What the application would do"),
      existingFiles: z
        .array(z.string())
        .describe("Files from your repos that would be used (format: 'repo/path' e.g. 'my-app/src/utils.ts')"),
      missingFiles: z
        .array(z.string())
        .describe("Specific files that need to be created to complete the project (e.g. 'src/index.ts', 'package.json')"),
      completenessNote: z
        .string()
        .describe("Brief note on completeness, e.g. 'Ready to build' or '2 files short - needs X and Y'"),
    })
  ),
});

export type DiscoveredProject = z.infer<typeof projectSchema>["potentialProjects"][0];

export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    if (!token || token.includes("your_") || /ghp_your|ghp_xxxx|replace_me/i.test(token)) {
      return NextResponse.json(
        { error: "Sign in with GitHub to use this feature, or configure GITHUB_TOKEN in .env.local" },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes("your-")) {
      return NextResponse.json(
        { error: "Configure OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    let options = { limit: 40, excludeForks: true, excludeArchived: true, projectCount: 5 };
    try {
      const body = await request.json().catch(() => ({}));
      if (typeof body === "object" && body !== null) {
        if (typeof body.limit === "number") options.limit = Math.min(100, Math.max(5, body.limit));
        if (typeof body.excludeForks === "boolean") options.excludeForks = body.excludeForks;
        if (typeof body.excludeArchived === "boolean") options.excludeArchived = body.excludeArchived;
        if (typeof body.projectCount === "number")
          options.projectCount = Math.min(30, Math.max(1, body.projectCount));
      }
    } catch {
      // use defaults
    }

    const repos = await fetchUserRepos(token, options);
    if (repos.length === 0) {
      return NextResponse.json(
        { error: "No repositories found for your account" },
        { status: 404 }
      );
    }

    const repoFileMap: Record<string, { description: string; files: string[] }> = {};
    for (const r of repos) {
      const files = await fetchRepoFileTree(r.full_name, r.default_branch, token);
      repoFileMap[r.full_name] = { description: r.description, files };
    }

    const context = Object.entries(repoFileMap)
      .map(([name, { description, files }]) => {
        const fileList = files.slice(0, 200).join("\n  - ");
        return `## ${name}${description ? `\n${description}` : ""}\nFiles:\n  - ${fileList}${files.length > 200 ? `\n  ... and ${files.length - 200} more` : ""}`;
      })
      .join("\n\n");

    const openai = new OpenAI({ apiKey });
    const prompt = `You are analyzing a developer's GitHub repositories to find potential applications they could build by combining existing files across repos.

Below is a list of their repos with file paths. Your job:
1. Identify applications that could be built by reusing/combining files from one or more repos.
2. Include ideas that are ALMOST complete - even if a few files are missing. For those, list the EXACT file paths/names needed (e.g. "src/main.ts", "config.json", "package.json").
3. Be specific about which existing files would be used (format: repo_name/path).
4. For each potential project, provide: name, description, existing files to use, missing files to create, and a brief completeness note.

Output exactly ${options.projectCount} potential projects. Prioritize: (a) projects that are ready or nearly ready, (b) creative combinations across repos, (c) clear value/utility.

---REPOS AND FILES---

${context}

---END---

Respond with valid JSON: { "potentialProjects": [ { "name": string, "description": string, "existingFiles": string[], "missingFiles": string[], "completenessNote": string } ] }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = projectSchema.parse(JSON.parse(content));
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
