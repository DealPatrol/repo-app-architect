'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ActivitySquare, Edit3, CheckCircle, MessageSquare, Paperclip } from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  description: string
  user_name: string
  user_email: string
  created_at: string
  metadata?: any
}

interface ActivityFeedProps {
  projectId: string
}

const getActivityIcon = (entityType: string) => {
  switch (entityType) {
    case 'task':
      return <CheckCircle className="h-4 w-4" />
    case 'comment':
      return <MessageSquare className="h-4 w-4" />
    case 'attachment':
      return <Paperclip className="h-4 w-4" />
    case 'project':
      return <ActivitySquare className="h-4 w-4" />
    default:
      return <Edit3 className="h-4 w-4" />
  }
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/activity?limit=100`)
        if (res.ok) {
          const data = await res.json()
          setActivities(data)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    const interval = setInterval(fetchActivities, 30000)

    return () => clearInterval(interval)
  }, [projectId])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities yet</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
              <div className="mt-1 text-muted-foreground">{getActivityIcon(activity.entity_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user_name || 'User'}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {' '}
                  <span className="font-medium">{activity.entity_type}</span>
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
