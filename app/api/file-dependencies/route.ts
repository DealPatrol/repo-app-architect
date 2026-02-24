import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/get-github-token";
import { ghHeaders } from "@/lib/github";

/** Extract imports from JS/TS content using simple regex */
function extractImports(content: string): string[] {
  const imports = new Set<string>();

  // import x from 'path'
  // import { x } from 'path'
  // import * as x from 'path'
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\* as \w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(content))) {
    const path = m[1];
    if (!path.startsWith(".") && !path.startsWith("/")) continue; // skip node_modules style
    imports.add(path);
  }

  // require('path')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = requireRegex.exec(content))) {
    const path = m[1];
    if (!path.startsWith(".") && !path.startsWith("/")) continue;
    imports.add(path);
  }

  return Array.from(imports);
}

/** Resolve relative import to file path given the current file path */
function resolveImport(imp: string, currentPath: string): string {
  const parts = currentPath.split("/");
  parts.pop();
  const impParts = imp.split("/");
  for (const p of impParts) {
    if (p === "..") parts.pop();
    else if (p !== ".") parts.push(p);
  }
  let resolved = parts.join("/");
  if (!resolved.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)) resolved += ".ts";
  return resolved;
}

export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    if (!token || /your_|ghp_your|ghp_xxxx/i.test(token)) {
      return NextResponse.json(
        { error: "Sign in with GitHub to analyze dependencies" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { files: string[] };
    const { files } = body;
    if (!Array.isArray(files) || files.length === 0 || files.length > 20) {
      return NextResponse.json(
        { error: "Provide files array (1–20 items)" },
        { status: 400 }
      );
    }

    const headers = ghHeaders(token);

    const results: { path: string; imports: string[]; resolvedPaths: string[] }[] = [];

    for (const filePath of files) {
      const parts = filePath.split("/");
      if (parts.length < 3) continue;
      let owner = parts[0];
      let repo = parts[1];
      let path = parts.slice(2).join("/");

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

      const imports = extractImports(content);
      const resolvedPaths = imports.map((imp) => resolveImport(imp, path));

      results.push({ path: filePath, imports, resolvedPaths });
    }

    return NextResponse.json({ files: results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to analyze dependencies" },
      { status: 500 }
    );
  }
}
