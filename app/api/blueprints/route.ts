import { NextRequest, NextResponse } from 'next/server';
import { getCurrentOrganizationId, getCurrentUser } from '@/lib/auth';
import {
  createBlueprint,
  deleteBlueprintsByUserAndSource,
  getBlueprintsByUser,
  getProjectsByOrganization,
  type AppBlueprint,
} from '@/lib/queries';
import { generateBlueprints } from '@/lib/blueprint-generator';

type GenerateBody = {
  sourceName?: string;
  files?: string[];
};

function extractProjectFiles(projects: Awaited<ReturnType<typeof getProjectsByOrganization>>) {
  return projects.map((project) => `projects/${project.slug || project.id}/README.md`);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blueprints = await getBlueprintsByUser(user.id);
    return NextResponse.json(blueprints);
  } catch (error) {
    console.error('Error listing blueprints:', error);
    return NextResponse.json({ error: 'Failed to list blueprints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = ((await request.json().catch(() => ({}))) ?? {}) as GenerateBody;
    const orgId = getCurrentOrganizationId(user);
    const projects = orgId ? await getProjectsByOrganization(orgId) : [];

    const sourceName = body.sourceName?.trim() || 'workspace';
    const filesFromRequest = Array.isArray(body.files) ? body.files.filter((f): f is string => typeof f === 'string') : [];
    const inferredProjectFiles = extractProjectFiles(projects);
    const files = [...new Set([...filesFromRequest, ...inferredProjectFiles])];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files or projects found to generate blueprints from.' },
        { status: 400 }
      );
    }

    const generated = await generateBlueprints({ sourceName, files });
    if (generated.length === 0) {
      return NextResponse.json(
        { error: 'Unable to generate blueprints from the provided context.' },
        { status: 422 }
      );
    }

    await deleteBlueprintsByUserAndSource(user.id, sourceName);

    const saved: AppBlueprint[] = [];
    for (const bp of generated) {
      const created = await createBlueprint({
        user_id: user.id,
        source_name: sourceName,
        name: bp.name,
        description: bp.description,
        app_type: bp.app_type,
        complexity: bp.complexity,
        reuse_percentage: bp.reuse_percentage,
        existing_files: bp.existing_files,
        missing_files: bp.missing_files,
        estimated_effort: bp.estimated_effort,
        technologies: bp.technologies,
        ai_explanation: bp.ai_explanation,
      });
      saved.push(created);
    }

    return NextResponse.json({
      sourceName,
      generatedCount: saved.length,
      blueprints: saved,
    });
  } catch (error) {
    console.error('Error generating blueprints:', error);
    return NextResponse.json({ error: 'Failed to generate blueprints' }, { status: 500 });
  }
}
