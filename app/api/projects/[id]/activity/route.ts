import { getDb } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb()
    const { id: projectId } = await params
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

    const result = await sql`
      SELECT id, action, entity_type, entity_id, description, metadata, created_at, user_id
      FROM activity_logs
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb()
    const { id: projectId } = await params
    const { user_id, action, entity_type, entity_id, description, metadata } = await request.json()

    if (!user_id || !action || !entity_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, description, metadata)
      VALUES (${projectId}, ${user_id}, ${action}, ${entity_type}, ${entity_id || null}, ${description || null}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json({ error: 'Failed to create activity log' }, { status: 500 })
  }
}
