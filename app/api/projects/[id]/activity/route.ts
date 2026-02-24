import { db } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const limit = request.nextUrl.searchParams.get('limit') || '50'

    const result = await db.query(
      `SELECT 
        al.id, al.action, al.entity_type, al.entity_id, al.description, al.metadata, al.created_at,
        u.name as user_name, u.email as user_email
       FROM activity_logs al
       LEFT JOIN neon_auth."user" u ON al.user_id = u.id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [projectId, parseInt(limit)]
    )

    return NextResponse.json(result.rows)
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
    const { id: projectId } = await params
    const { user_id, action, entity_type, entity_id, description, metadata } = await request.json()

    if (!user_id || !action || !entity_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId, user_id, action, entity_type, entity_id || null, description || null, JSON.stringify(metadata || {})]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json({ error: 'Failed to create activity log' }, { status: 500 })
  }
}
