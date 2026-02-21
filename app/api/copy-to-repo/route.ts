import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/get-github-token";
import { ghHeaders } from "@/lib/github";

/** Copy files from user's repos into a new repo. Files are in format "owner/repo/path" or "repo/path" */
export async function POST(request: Request) {
  try {
    const token = await getGitHubToken();
    if (!token || /your_|ghp_your|ghp_xxxx/i.test(token)) {
      return NextResponse.json(
        { error: "Sign in with GitHub to copy files" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      newRepoName: string;
      files: string[]; // e.g. ["my-app/src/utils.ts"] or ["owner/repo/src/utils.ts"]
      description?: string;
    };

    const { newRepoName, files, description } = body;
    if (!newRepoName?.trim() || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Provide newRepoName and files array" },
        { status: 400 }
      );
    }

    const headers = ghHeaders(token);

    // Get current user
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) throw new Error("Failed to get user");
    const user = (await userRes.json()) as { login: string };
    const owner = user.login;

    // Create new repo
    const repoNameClean = newRepoName.replace(/[^a-zA-Z0-9_.-]/g, "-");
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: repoNameClean,
        description: description || "Created with Repo Architect",
        private: false,
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to create repo");
    }

    const newRepo = (await createRes.json()) as { default_branch: string; name: string };
    const branch = newRepo.default_branch || "main";
    const createdRepoName = newRepo.name;

    // Fetch each file and create blobs
    const blobPromises = files.slice(0, 50).map(async (filePath) => {
      // filePath is "repo/path" (user's repo) or "owner/repo/path"
      const parts = filePath.split("/");
      if (parts.length < 2) return null;
      let srcOwner = owner;
      let srcRepo: string;
      let path: string;
      if (parts.length === 2) {
        srcRepo = parts[0];
        path = parts[1];
      } else if (parts.length >= 3 && parts[0] !== owner) {
        srcOwner = parts[0];
        srcRepo = parts[1];
        path = parts.slice(2).join("/");
      } else {
        srcRepo = parts[0];
        path = parts.slice(1).join("/");
      }

      const contentRes = await fetch(
        `https://api.github.com/repos/${srcOwner}/${srcRepo}/contents/${path}`,
        { headers }
      );
      if (!contentRes.ok) return null;
      const contentData = (await contentRes.json()) as { content?: string; encoding?: string };
      const content = contentData.encoding === "base64"
        ? Buffer.from(contentData.content || "", "base64").toString("utf-8")
        : contentData.content || "";
      const decoded = Buffer.from(content, "utf-8").toString("base64");

      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${createdRepoName}/git/blobs`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ content: decoded, encoding: "base64" }),
      });
      if (!blobRes.ok) return null;
      const blob = (await blobRes.json()) as { sha: string };
      return { path, sha: blob.sha };
    });

    const blobs = (await Promise.all(blobPromises)).filter(
      (b): b is { path: string; sha: string } => b !== null
    );

    if (blobs.length === 0) {
      return NextResponse.json(
        { error: "Could not fetch any of the specified files" },
        { status: 400 }
      );
    }

    // Get ref for branch
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${createdRepoName}/git/ref/heads/${branch}`,
      { headers }
    );
    let refResponse = refRes;
    if (!refRes.ok) {
      const refMain = await fetch(
        `https://api.github.com/repos/${owner}/${createdRepoName}/git/ref/heads/main`,
        { headers }
      );
      if (!refMain.ok) {
        return NextResponse.json(
          { error: "Repo created but could not get branch ref" },
          { status: 500 }
        );
      }
      refResponse = refMain;
    }

    const refData = (await refResponse.json()) as { object?: { sha: string } };
    const baseTreeSha = refData?.object?.sha;

    const tree = blobs.map((b) => ({
      path: b.path.includes("/") ? b.path : b.path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: b.sha,
    }));

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${createdRepoName}/git/trees`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ base_tree: baseTreeSha, tree }),
      }
    );
    if (!treeRes.ok) {
      const err = await treeRes.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to create tree");
    }
    const treeData = (await treeRes.json()) as { sha: string };

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${createdRepoName}/git/commits`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Initial commit – files from Repo Architect",
          tree: treeData.sha,
          parents: baseTreeSha ? [baseTreeSha] : [],
        }),
      }
    );
    if (!commitRes.ok) throw new Error("Failed to create commit");
    const commitData = (await commitRes.json()) as { sha: string };

    const updateRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${createdRepoName}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ sha: commitData.sha }),
      }
    );
    if (!updateRefRes.ok) throw new Error("Failed to update ref");

    const url = `https://github.com/${owner}/${createdRepoName}`;
    return NextResponse.json({ url, filesCopied: blobs.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Copy failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
