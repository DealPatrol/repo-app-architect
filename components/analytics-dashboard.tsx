'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, ListTodo, CheckCircle2, TrendingUp } from 'lucide-react'

interface AnalyticsData {
  tasks: { status: string; count: number }[]
  priorities: { priority: string; count: number }[]
  completion: { completed: number; total: number }
  team: { name: string; assigned_tasks: number; completed_tasks: number }[]
  activity: { date: string; count: number }[]
}

interface AnalyticsDashboardProps {
  projectId: string
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#ef4444',
  in_progress: '#f59e0b',
  in_review: '#3b82f6',
  done: '#10b981',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#991b1b',
}

export function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/analytics`)
        if (res.ok) {
          const analyticsData = await res.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [projectId])

  if (loading) {
    return (
      <div className="grid gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">No analytics data available</div>
  }

  const completionRate = data.completion.total > 0 
    ? Math.round((data.completion.completed / data.completion.total) * 100)
    : 0

  return (
    <div className="grid gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{data.completion.total}</p>
            </div>
            <ListTodo className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{data.completion.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{data.team.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.tasks}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.tasks.map((entry) => (
                  <Cell key={`cell-${entry.status}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.priorities}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="priority" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              />
              <Bar dataKey="count" fill="#3b82f6">
                {data.priorities.map((entry) => (
                  <Cell key={`cell-${entry.priority}`} fill={PRIORITY_COLORS[entry.priority] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-4">Team Member</th>
                <th className="text-right py-2 px-4">Assigned</th>
                <th className="text-right py-2 px-4">Completed</th>
                <th className="text-right py-2 px-4">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.team.map((member) => {
                const rate = member.assigned_tasks > 0 
                  ? Math.round((member.completed_tasks / member.assigned_tasks) * 100)
                  : 0
                return (
                  <tr key={member.name} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{member.name}</td>
                    <td className="text-right py-3 px-4">{member.assigned_tasks}</td>
                    <td className="text-right py-3 px-4">{member.completed_tasks}</td>
                    <td className="text-right py-3 px-4">
                      <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                        {rate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
