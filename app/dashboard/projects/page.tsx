'use client'

import { useState, useEffect } from 'react'
import { ProjectsList } from '@/components/projects-list'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

const DEMO_PROJECTS = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website with new branding',
    color: '#3b82f6',
    icon: 'W',
    visibility: 'private' as const,
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Native iOS and Android application launch',
    color: '#10b981',
    icon: 'M',
    visibility: 'private' as const,
  },
  {
    id: '3',
    name: 'API Development',
    description: 'Backend API for third-party integrations',
    color: '#f59e0b',
    icon: 'A',
    visibility: 'private' as const,
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Try to fetch from API
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        } else {
          throw new Error('Failed to fetch projects')
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Database not connected - showing demo projects')
        setProjects(DEMO_PROJECTS)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-yellow-200 bg-yellow-50/50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              {error}. Set DATABASE_URL environment variable to use your own projects.
            </p>
          </div>
        </Card>
      )}
      <ProjectsList projects={projects} />
    </div>
  )
}

