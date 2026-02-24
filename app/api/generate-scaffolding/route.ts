import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import archiver from "archiver";
import { Readable } from "stream";

const bodySchema = z.object({
  directionName: z.string(),
  fullDescription: z.string(),
  projectDescription: z.string(),
  missingFiles: z.array(
    z.object({
      path: z.string(),
      description: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes("your-")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { directionName, fullDescription, projectDescription, missingFiles } = parsed.data;

    if (missingFiles.length === 0) {
      return NextResponse.json({ error: "No missing files to generate" }, { status: 400 });
    }

    if (missingFiles.length > 12) {
      return NextResponse.json({ error: "Too many files. Limit 12." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are generating starter code (scaffolding) for a developer.

Project: "${projectDescription}"
Direction: "${directionName}"
Direction details: ${fullDescription}

Generate starter code for these files. Return valid JSON:
{ "files": [ { "path": "exact path from input", "content": "full file content as string" } ] }

Rules:
- Generate realistic, runnable starter code (imports, types, basic structure)
- Use appropriate syntax for file extension (.ts, .tsx, .json, etc.)
- Keep each file under 150 lines
- Include helpful comments
- Match the path exactly as given

Files to generate:
${missingFiles.map((f) => `- ${f.path}: ${f.description}`).join("\n")}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response");

    const result = z
      .object({
        files: z.array(z.object({ path: z.string(), content: z.string() })),
      })
      .parse(JSON.parse(content));

    const archive = archiver("zip", { zlib: { level: 9 } });
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      const bufs: Buffer[] = [];
      archive.on("data", (c: Buffer) => bufs.push(c));
      archive.on("end", () => resolve(Buffer.concat(bufs)));
      archive.on("error", reject);
    });

    for (const f of result.files) {
      archive.append(f.content, { name: f.path });
    }
    await archive.finalize();
    const buffer = await bufferPromise;

    const filename = `${directionName.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}-scaffolding.zip`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Scaffolding generation failed. Please try again." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
