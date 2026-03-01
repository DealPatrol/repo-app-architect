import { getProjectsByOrganization } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Folder, Users, CheckSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Demo projects for demonstration when database isn't available
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
]

export default async function DashboardPage() {
  let projects: any[] = []
  let dbError = false

  try {
    // Try to fetch from database
    projects = await getProjectsByOrganization('demo-org')
  } catch (error) {
    // If database isn't available, show demo projects
    console.error('[v0] Database connection error - showing demo projects:', error)
    dbError = true
    projects = DEMO_PROJECTS
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here is your project overview.</p>
        {dbError && (
          <div className="mt-4 flex items-gap gap-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 dark:border-yellow-900/30 dark:bg-yellow-900/20">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Note: Database is not connected. Showing demo projects. Set DATABASE_URL environment variable to use your own projects.
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
            </div>
            <Folder className="h-8 w-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <CheckSquare className="h-8 w-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold text-foreground">1</p>
            </div>
            <Users className="h-8 w-8 text-primary/50" />
          </div>
        </Card>
      </div>

      {/* Projects section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Projects</h2>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/projects">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first project to organize your tasks.
            </p>
            <Button asChild>
              <Link href="/dashboard/projects">Create Your First Project</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group"
              >
                <Card className="p-6 hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    >
                      {project.icon || project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground capitalize">
                      {project.visibility}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

