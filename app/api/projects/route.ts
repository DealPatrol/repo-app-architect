import { createProject } from '@/lib/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with real auth when auth is integrated
    const userId = 'demo-user'
    const orgId = 'demo-org'

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const project = await createProject({
      organization_id: orgId,
      name: name.trim(),
      description: description?.trim() || null,
      slug,
      status: 'active',
      visibility: 'private',
      color: '#3B82F6',
      icon: null,
      created_by: userId,
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
