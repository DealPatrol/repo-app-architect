import { db } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    const result = await db.query(
      'SELECT * FROM task_attachments WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const { file_url, file_name, file_size, mime_type } = await request.json()

    if (!file_url || !file_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.query(
      `INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_url, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [taskId, user.id, file_name, file_url, file_size || null, mime_type || null]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating attachment:', error)
    return NextResponse.json({ error: 'Failed to create attachment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const { attachment_id } = await request.json()

    if (!attachment_id) {
      return NextResponse.json({ error: 'Missing attachment_id' }, { status: 400 })
    }

    await db.query('DELETE FROM task_attachments WHERE id = $1 AND task_id = $2', [attachment_id, taskId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 })
  }
}
