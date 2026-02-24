import { getDb } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb()
    const { id: projectId } = await params

    const tasks = await sql`
      SELECT status, COUNT(*)::int as count
      FROM tasks
      WHERE project_id = ${projectId}
      GROUP BY status
    `

    const priorities = await sql`
      SELECT priority, COUNT(*)::int as count
      FROM tasks
      WHERE project_id = ${projectId}
      GROUP BY priority
    `

    const completion = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'done' THEN 1 END)::int as completed,
        COUNT(*)::int as total
      FROM tasks
      WHERE project_id = ${projectId}
    `

    const activity = await sql`
      SELECT 
        DATE_TRUNC('day', created_at)::date as date,
        COUNT(*)::int as count
      FROM activity_logs
      WHERE project_id = ${projectId}
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      tasks,
      priorities,
      completion: completion[0] || { completed: 0, total: 0 },
      team: [],
      activity,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
