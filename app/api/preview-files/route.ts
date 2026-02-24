import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/get-github-token";
import { ghHeaders } from "@/lib/github";

/** Fetch file contents from GitHub for preview. */
export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    if (!token || /your_|ghp_your|ghp_xxxx/i.test(token)) {
      return NextResponse.json(
        { error: "Sign in with GitHub to preview files" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { files: string[] };
    const { files } = body;
    if (!Array.isArray(files) || files.length === 0 || files.length > 30) {
      return NextResponse.json(
        { error: "Provide files array (1–30 items)" },
        { status: 400 }
      );
    }

    const headers = ghHeaders(token);

    const results: { path: string; content: string }[] = [];

    for (const filePath of files) {
      const parts = filePath.split("/");
      if (parts.length < 3) continue;
      const owner = parts[0];
      const repo = parts[1];
      const path = parts.slice(2).join("/");

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        { headers }
      );
      if (!res.ok) continue;

      const data = (await res.json()) as { content?: string; encoding?: string };
      const content =
        data.encoding === "base64"
          ? Buffer.from(data.content || "", "base64").toString("utf-8")
          : data.content || "";

      results.push({ path: filePath, content });
    }

    return NextResponse.json({ files: results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch files" },
      { status: 500 }
    );
  }
}
