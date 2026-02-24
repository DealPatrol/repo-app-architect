import { db } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const result = await db.query(
      `SELECT 
        pm.id, pm.role, pm.added_at,
        u.id as user_id, u.name, u.email
       FROM project_members pm
       JOIN neon_auth."user" u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.added_at DESC`,
      [projectId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching project members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const { user_id, role } = await request.json()

    if (!user_id || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT(project_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [projectId, user_id, role]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding project member:', error)
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { member_id } = await request.json()

    if (!member_id) {
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 })
    }

    await db.query('DELETE FROM project_members WHERE id = $1', [member_id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing project member:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
