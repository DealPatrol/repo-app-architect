import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { fetchUserRepos, fetchRepoFileTree } from "@/lib/github";
import { getGitHubToken } from "@/lib/get-github-token";

const reusableFilesSchema = z.object({
  reusableFiles: z.array(
    z.object({
      path: z.string().describe("Full path in format repo/path (e.g. my-app/src/utils.ts)"),
      reason: z.string().describe("Brief note on why this file is useful for the user's project"),
    })
  ),
});

export type ReusableFile = z.infer<typeof reusableFilesSchema>["reusableFiles"][0];

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

    const body = (await request.json().catch(() => ({}))) as {
      projectDescription?: string;
      limit?: number;
      excludeForks?: boolean;
      excludeArchived?: boolean;
    };

    const projectDescription = typeof body.projectDescription === "string" ? body.projectDescription.trim() : "";
    if (!projectDescription) {
      return NextResponse.json(
        { error: "Provide a project description (what you're building)" },
        { status: 400 }
      );
    }

    const options = {
      limit: typeof body.limit === "number" ? Math.min(60, Math.max(5, body.limit)) : 25,
      excludeForks: typeof body.excludeForks === "boolean" ? body.excludeForks : true,
      excludeArchived: typeof body.excludeArchived === "boolean" ? body.excludeArchived : true,
    };

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
        const fileList = files.slice(0, 300).join("\n  - ");
        return `## ${name}${description ? `\n${description}` : ""}\nFiles:\n  - ${fileList}${files.length > 300 ? `\n  ... and ${files.length - 300} more` : ""}`;
      })
      .join("\n\n");

    const openai = new OpenAI({ apiKey });
    const prompt = `A developer wants to build: "${projectDescription}"

Below are their GitHub repositories with file paths. Your job is to identify ALL files from their repos that they could REUSE in this new project. Include:
- Utility/helper files
- Config files (package.json, tsconfig, tailwind config, etc.)
- Component or module files that match the project
- Shared styles, types, or constants
- Any file that could save them from rewriting code

For each reusable file, provide the full path (format: repo_name/path) and a brief reason why it's useful.
Be thorough - include everything that could be reused. Prioritize high-value reusability (components, utilities, configs).

---REPOS AND FILES---

${context}

---END---

Respond with valid JSON: { "reusableFiles": [ { "path": "repo/path/to/file", "reason": "Why it's useful" } ] }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = reusableFilesSchema.parse(JSON.parse(content));
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Find files failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
