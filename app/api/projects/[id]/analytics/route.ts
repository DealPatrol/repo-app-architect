import { db } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Get task statistics
    const tasksResult = await db.query(
      `SELECT 
        status, COUNT(*)::int as count
       FROM tasks
       WHERE project_id = $1
       GROUP BY status`,
      [projectId]
    )

    // Get priority distribution
    const priorityResult = await db.query(
      `SELECT 
        priority, COUNT(*)::int as count
       FROM tasks
       WHERE project_id = $1
       GROUP BY priority`,
      [projectId]
    )

    // Get task completion rate
    const completionResult = await db.query(
      `SELECT 
        COUNT(CASE WHEN status = 'done' THEN 1 END)::int as completed,
        COUNT(*)::int as total
       FROM tasks
       WHERE project_id = $1`,
      [projectId]
    )

    // Get team member activity
    const teamResult = await db.query(
      `SELECT 
        u.id, u.name, u.email,
        COUNT(t.id)::int as assigned_tasks,
        COUNT(CASE WHEN t.status = 'done' THEN 1 END)::int as completed_tasks
       FROM neon_auth."user" u
       LEFT JOIN tasks t ON u.id = t.assigned_to AND t.project_id = $1
       JOIN project_members pm ON u.id = pm.user_id AND pm.project_id = $1
       GROUP BY u.id, u.name, u.email`,
      [projectId]
    )

    // Get recent activity
    const activityResult = await db.query(
      `SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*)::int as count
       FROM activity_logs
       WHERE project_id = $1
       AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY date DESC`,
      [projectId]
    )

    return NextResponse.json({
      tasks: tasksResult.rows,
      priorities: priorityResult.rows,
      completion: completionResult.rows[0],
      team: teamResult.rows,
      activity: activityResult.rows,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
