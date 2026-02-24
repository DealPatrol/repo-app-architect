import { createProject } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentOrganizationId, getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const organizationId = getCurrentOrganizationId(user);

    if (!user || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const project = await createProject({
      organization_id: organizationId,
      name: name.trim(),
      description: description?.trim() || null,
      slug,
      status: 'active',
      visibility: 'private',
      color: '#3B82F6',
      icon: 'P',
      created_by: user.id,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
