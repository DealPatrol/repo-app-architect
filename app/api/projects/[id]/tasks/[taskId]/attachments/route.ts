import { db } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
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
    const { taskId } = await params
    const { file_url, file_name, file_size, mime_type, uploaded_by } = await request.json()

    if (!file_url || !file_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.query(
      `INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_url, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [taskId, uploaded_by, file_name, file_url, file_size || null, mime_type || null]
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
    const { attachment_id } = await request.json()

    if (!attachment_id) {
      return NextResponse.json({ error: 'Missing attachment_id' }, { status: 400 })
    }

    await db.query('DELETE FROM task_attachments WHERE id = $1', [attachment_id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 })
  }
}
