import { getDb } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const sql = getDb()
    const { taskId } = await params

    const result = await sql`
      SELECT * FROM task_attachments WHERE task_id = ${taskId} ORDER BY created_at DESC
    `

    return NextResponse.json(result)
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
    const sql = getDb()
    const { taskId } = await params
    const { file_url, file_name, file_size, mime_type, uploaded_by } = await request.json()

    if (!file_url || !file_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_url, file_size, mime_type)
      VALUES (${taskId}, ${uploaded_by}, ${file_name}, ${file_url}, ${file_size || null}, ${mime_type || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating attachment:', error)
    return NextResponse.json({ error: 'Failed to create attachment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const sql = getDb()
    const { attachment_id } = await request.json()

    if (!attachment_id) {
      return NextResponse.json({ error: 'Missing attachment_id' }, { status: 400 })
    }

    await sql`DELETE FROM task_attachments WHERE id = ${attachment_id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 })
  }
}
