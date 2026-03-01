import { getDb } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb()
    const { id: projectId } = await params

    const result = await sql`
      SELECT id, project_id, user_id, role, added_at
      FROM project_members
      WHERE project_id = ${projectId}
      ORDER BY added_at DESC
    `

    return NextResponse.json(result)
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
    const sql = getDb()
    const { id: projectId } = await params
    const { user_id, role } = await request.json()

    if (!user_id || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (${projectId}, ${user_id}, ${role})
      ON CONFLICT(project_id, user_id) DO UPDATE SET role = ${role}
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error adding project member:', error)
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const sql = getDb()
    const { member_id } = await request.json()

    if (!member_id) {
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 })
    }

    await sql`DELETE FROM project_members WHERE id = ${member_id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing project member:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
