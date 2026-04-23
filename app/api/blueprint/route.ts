import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";

type DiscoveredProject = {
  name: string;
  description: string;
  existingFiles: string[];
  missingFiles: string[];
  completenessNote: string;
};

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function drawTextBlock(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  color = rgb(0, 0, 0)
) {
  const lineHeight = fontSize + 3;
  const lines = wrapText(text, font, fontSize, maxWidth);
  let cursorY = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cursorY, font, size: fontSize, color });
    cursorY -= lineHeight;
  }
  return cursorY;
}

async function buildDiscoveredPdf(projects: DiscoveredProject[]) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const width = 612;
  const height = 792;
  const contentWidth = width - margin * 2;
  const ensurePage = (y: number) => {
    if (y > margin) return { page: currentPage, y };
    currentPage = pdfDoc.addPage([width, height]);
    return { page: currentPage, y: height - margin };
  };

  let currentPage = pdfDoc.addPage([width, height]);
  let y = height - margin;

  currentPage.drawText("Discovered Projects from Your Repos", {
    x: margin,
    y,
    font: bold,
    size: 22,
    color: rgb(0, 0, 0),
  });
  y -= 28;

  currentPage.drawText(`Generated ${new Date().toLocaleDateString()} • ${projects.length} projects`, {
    x: margin,
    y,
    font: regular,
    size: 11,
    color: rgb(0.45, 0.45, 0.45),
  });
  y -= 24;

  for (let index = 0; index < projects.length; index++) {
    const project = projects[index];
    ({ page: currentPage, y } = ensurePage(y));
    y = drawTextBlock(
      currentPage,
      `${index + 1}. ${project.name}`,
      margin,
      y,
      bold,
      15,
      contentWidth
    );
    y -= 4;
    y = drawTextBlock(
      currentPage,
      String(project.description || ""),
      margin,
      y,
      regular,
      10,
      contentWidth
    );
    y -= 2;
    y = drawTextBlock(
      currentPage,
      String(project.completenessNote || ""),
      margin,
      y,
      regular,
      9,
      contentWidth,
      rgb(0.63, 0.38, 0)
    );
    y -= 6;

    const existingFiles = Array.isArray(project.existingFiles) ? project.existingFiles : [];
    const missingFiles = Array.isArray(project.missingFiles) ? project.missingFiles : [];

    if (existingFiles.length > 0) {
      ({ page: currentPage, y } = ensurePage(y));
      y = drawTextBlock(currentPage, "Existing files:", margin, y, bold, 10, contentWidth);
      for (const filePath of existingFiles.slice(0, 15)) {
        ({ page: currentPage, y } = ensurePage(y));
        y = drawTextBlock(currentPage, `• ${String(filePath)}`, margin + 10, y, regular, 9, contentWidth - 10);
      }
      if (existingFiles.length > 15) {
        ({ page: currentPage, y } = ensurePage(y));
        y = drawTextBlock(
          currentPage,
          `... and ${existingFiles.length - 15} more`,
          margin + 10,
          y,
          regular,
          9,
          contentWidth - 10
        );
      }
    }

    if (missingFiles.length > 0) {
      ({ page: currentPage, y } = ensurePage(y));
      y = drawTextBlock(currentPage, "Files to create:", margin, y, bold, 10, contentWidth);
      for (const filePath of missingFiles) {
        ({ page: currentPage, y } = ensurePage(y));
        y = drawTextBlock(currentPage, `+ ${String(filePath)}`, margin + 10, y, regular, 9, contentWidth - 10);
      }
    }
    y -= 12;
  }

  return Buffer.from(await pdfDoc.save());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { type?: string; projects?: DiscoveredProject[] };
    if (body.type !== "discovered" || !Array.isArray(body.projects) || body.projects.length === 0) {
      return NextResponse.json({ error: "Missing discovered projects payload" }, { status: 400 });
    }

    const pdfBuffer = await buildDiscoveredPdf(body.projects);

    const fileName = `discovered-projects-${Date.now()}.pdf`;
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Blueprint PDF error:", error);
    }
    return NextResponse.json({ error: "PDF generation failed. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";
