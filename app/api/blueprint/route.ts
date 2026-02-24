import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import type { RepoAnalysis } from "../analyze-repo/route";
import type { DiscoveredProject } from "../discover-projects/route";
import type { FindFilesDirection, ReusableFile } from "../find-files-for-project/route";

function buildRepoPdf(doc: PDFDocument, data: RepoAnalysis, title: string) {
  doc.fontSize(24).text(title, { align: "center" });
  doc.moveDown(2);

  if (data.summary) {
    doc.fontSize(18).text("Summary", { underline: true } as Record<string, unknown>);
    doc.fontSize(11).text(data.summary, { align: "justify" });
    doc.moveDown(2);
  }

  const techStack = "techStack" in data ? data.techStack : [];
  if (Array.isArray(techStack) && techStack.length > 0) {
    doc.fontSize(18).text("Tech Stack", { underline: true } as Record<string, unknown>);
    doc.fontSize(11);
    techStack.forEach((t: string) => doc.text(`• ${t}`));
    doc.moveDown(2);
  }

  if ("architecture" in data && data.architecture) {
    doc.fontSize(18).text("Architecture", { underline: true } as Record<string, unknown>);
    doc.fontSize(11).text(data.architecture as string, { align: "justify" });
    doc.moveDown(2);
  }

  const deps = "dependencies" in data ? data.dependencies : [];
  if (Array.isArray(deps) && deps.length > 0) {
    doc.fontSize(18).text("Key Dependencies", { underline: true } as Record<string, unknown>);
    doc.fontSize(11);
    deps.forEach((d: string) => doc.text(`• ${d}`));
    doc.moveDown(2);
  }

  const capabilities = data.capabilities || [];
  if (capabilities.length > 0) {
    doc.fontSize(18).text("Capabilities", { underline: true } as Record<string, unknown>);
    doc.fontSize(11);
    capabilities.forEach((c: string) => doc.text(`• ${c}`));
    doc.moveDown(2);
  }

  const appConcepts = data.appConcepts || [];
  if (appConcepts.length > 0) {
    doc.fontSize(18).text("App Concepts", { underline: true } as Record<string, unknown>);
    doc.fontSize(11);
    appConcepts.forEach((c: string) => doc.text(`• ${c}`));
    doc.moveDown(2);
  }

  const improvements = "suggestedImprovements" in data ? data.suggestedImprovements : [];
  if (Array.isArray(improvements) && improvements.length > 0) {
    doc.fontSize(18).text("Suggested Improvements", { underline: true } as Record<string, unknown>);
    doc.fontSize(11);
    improvements.forEach((s: string) => doc.text(`→ ${s}`));
  }
}

function buildDiscoveredPdf(doc: PDFDocument, projects: DiscoveredProject[]) {
  const d = doc as PDFDocument & { fillColor: (color: string) => typeof doc };
  doc.fontSize(24).text("Discovered Projects from Your Repos", { align: "center" });
  doc.moveDown(2);
  d.fillColor("#71717a");
  doc.fontSize(11).text(`Generated ${new Date().toLocaleDateString()} • ${projects.length} projects`, {
    align: "center",
  });
  d.fillColor("#000000");
  doc.moveDown(3);

  projects.forEach((p, i) => {
    d.fillColor("#000000");
    doc.fontSize(16).text(`${i + 1}. ${p.name}`, { underline: true } as Record<string, unknown>);
    doc.fontSize(10).text(String(p.description || ""), { align: "justify" });
    doc.moveDown(0.5);
    d.fillColor("#a16207");
    doc.fontSize(9).text(String(p.completenessNote || ""));
    d.fillColor("#000000");
    doc.moveDown(0.5);
    const existingFiles = Array.isArray(p.existingFiles) ? p.existingFiles : [];
    const missingFiles = Array.isArray(p.missingFiles) ? p.missingFiles : [];
    if (existingFiles.length > 0) {
      doc.fontSize(10).text("Existing files:");
      existingFiles.slice(0, 15).forEach((f) => doc.fontSize(9).text(`  • ${String(f)}`));
      if (existingFiles.length > 15)
        doc.fontSize(9).text(`  ... and ${existingFiles.length - 15} more`);
    }
    if (missingFiles.length > 0) {
      doc.fontSize(10).text("Files to create:");
      missingFiles.forEach((f) => doc.fontSize(9).text(`  + ${String(f)}`));
    }
    doc.moveDown(2);
  });
}

function buildFindFilesPdfFromDirections(doc: PDFDocument, title: string, directions: FindFilesDirection[]) {
  const d = doc as PDFDocument & { fillColor: (color: string) => typeof doc };
  doc.fontSize(24).text("App Directions for Your Project", { align: "center" });
  doc.moveDown(1);
  doc.fontSize(14).text(title, { align: "center" });
  doc.moveDown(1);
  d.fillColor("#71717a");
  doc.fontSize(11).text(`Generated ${new Date().toLocaleDateString()} • ${directions.length} directions`, {
    align: "center",
  });
  d.fillColor("#000000");
  doc.moveDown(2);

  directions.forEach((dir, i) => {
    doc.fontSize(16).text(`${i + 1}. ${dir.name}`, { underline: true } as Record<string, unknown>);
    doc.fontSize(10).text(dir.shortDescription);
    doc.fontSize(9).text(dir.fullDescription);
    doc.moveDown(0.5);
    if (dir.existingFiles.length > 0) {
      doc.fontSize(10).text("Files you have:");
      dir.existingFiles.slice(0, 10).forEach((f) => doc.fontSize(9).text(`  • ${f.path}`));
    }
    if (dir.missingFiles.length > 0) {
      doc.fontSize(10).text("Files to create:");
      dir.missingFiles.forEach((f) => doc.fontSize(9).text(`  + ${f.path}`));
    }
    doc.moveDown(1.5);
  });
}

function buildFindFilesPdf(doc: PDFDocument, title: string, files: ReusableFile[]) {
  const d = doc as PDFDocument & { fillColor: (color: string) => typeof doc };
  doc.fontSize(24).text("Reusable Files for Your Project", { align: "center" });
  doc.moveDown(1);
  doc.fontSize(14).text(title, { align: "center" });
  doc.moveDown(1);
  d.fillColor("#71717a");
  doc.fontSize(11).text(`Generated ${new Date().toLocaleDateString()} • ${files.length} files`, {
    align: "center",
  });
  d.fillColor("#000000");
  doc.moveDown(2);

  files.forEach((f, i) => {
    doc.fontSize(10).text(`${i + 1}. ${f.path}`, { continued: false });
    d.fillColor("#52525b");
    doc.fontSize(9).text(`   ${f.reason}`);
    d.fillColor("#000000");
    doc.moveDown(0.5);
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data, repoName, projects, reusableFiles, directions, findFilesTitle } = body as {
      type: "full" | "summary" | "capabilities" | "appConcepts" | "discovered" | "findFiles";
      data?: RepoAnalysis;
      repoName?: string;
      projects?: DiscoveredProject[];
      reusableFiles?: ReusableFile[];
      directions?: FindFilesDirection[];
      findFilesTitle?: string;
    };

    const doc = new PDFDocument({ margin: 50 });
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: unknown) => chunks.push(chunk as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      if (type === "discovered" && Array.isArray(projects) && projects.length > 0) {
        buildDiscoveredPdf(doc, projects);
      } else if (type === "findFiles" && Array.isArray(directions) && directions.length > 0) {
        buildFindFilesPdfFromDirections(doc, findFilesTitle || "Your project", directions);
      } else if (type === "findFiles" && Array.isArray(reusableFiles) && reusableFiles.length > 0) {
        buildFindFilesPdf(doc, findFilesTitle || "Your project", reusableFiles);
      } else if (data) {
        const baseTitle = repoName ? `GitHub Repo Blueprint: ${repoName}` : "Repository Blueprint";
        if (type === "summary") {
          buildRepoPdf(doc, { ...data, capabilities: [], appConcepts: [] }, `${baseTitle} - Summary`);
        } else if (type === "capabilities") {
          buildRepoPdf(doc, { ...data, summary: "", appConcepts: [] }, `${baseTitle} - Capabilities`);
        } else if (type === "appConcepts") {
          buildRepoPdf(doc, { ...data, summary: "", capabilities: [] }, `${baseTitle} - App Concepts`);
        } else {
          buildRepoPdf(doc, data, baseTitle);
        }
      } else {
        reject(new Error("Missing data, projects, or reusableFiles"));
      }

      doc.end();
    });

    const filename =
      type === "discovered"
        ? `discovered-projects-${Date.now()}.pdf`
        : type === "findFiles"
          ? `reusable-files-${Date.now()}.pdf`
          : `blueprint-${type}-${Date.now()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Blueprint PDF error:", err);
    }
    return NextResponse.json({ error: "PDF generation failed. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";
