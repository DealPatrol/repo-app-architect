import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { fetchUserRepos, fetchRepoFileTree } from "@/lib/github";
import { getGitHubToken } from "@/lib/get-github-token";

const existingFileSchema = z.object({
  path: z.string().describe("Full path in format owner/repo/path (e.g. my-org/my-app/src/utils.ts)"),
  reason: z.string().describe("Brief note on why this file is useful for this direction"),
});

const missingFileSchema = z.object({
  path: z.string().describe("Suggested file path (e.g. src/clip-generator.ts)"),
  description: z.string().describe("What this file should implement or contain"),
});

const directionSchema = z.object({
  name: z.string().describe("Short, descriptive name for this app direction"),
  shortDescription: z.string().describe("One-line summary of what this direction produces"),
  fullDescription: z.string().describe("2-4 sentences describing the app, tech approach, and what users get"),
  existingFiles: z.array(existingFileSchema).describe("Files from user repos to reuse"),
  missingFiles: z.array(missingFileSchema).describe("Files user doesn't have; paths + what each should contain"),
});

const responseSchema = z.object({
  directions: z
    .array(directionSchema)
    .min(2)
    .max(5)
    .describe("Distinct app directions, e.g. short-form, long-form, advanced AI, budget/stock approach"),
});

export type FindFilesDirection = z.infer<typeof directionSchema>;
export type ReusableFile = z.infer<typeof existingFileSchema>;
export type MissingFile = z.infer<typeof missingFileSchema>;

export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    if (!token || token.includes("your_") || /ghp_your|ghp_xxxx|replace_me/i.test(token)) {
      return NextResponse.json(
        { error: "Sign in with GitHub to use this feature" },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes("your-")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
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

Below are their GitHub repositories with file paths. Your job is to propose 3-4 DISTINCT APP DIRECTIONS—different ways they could build this project. Examples: for "video app" → short-form (TikTok/Reels), long-form (YouTube), advanced AI (deepfake/ML), budget (stock footage). Each direction should have:
1. A clear name
2. existingFiles: files from their repos they can reuse (format: owner/repo/path)
3. missingFiles: files they DON'T have but need—suggest paths (e.g. src/clip-generator.ts) and what each file should implement

Be specific. Use their actual repo names in paths. For missing files, suggest realistic paths and clear descriptions of what to implement.

---REPOS AND FILES---

${context}

---END---

Respond with valid JSON: { "directions": [ { "name": "Direction name", "shortDescription": "One line", "fullDescription": "2-4 sentences", "existingFiles": [ { "path": "owner/repo/path", "reason": "why" } ], "missingFiles": [ { "path": "src/file.ts", "description": "what it should do" } ] } ] }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = responseSchema.parse(JSON.parse(content));
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Find files failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
