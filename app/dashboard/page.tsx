import { getAllProjects } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Folder, Users, CheckSquare } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  let projects: any[] = []

  try {
    // Fetch all projects from database
    projects = await getAllProjects()
  } catch {
    // If database isn't available, show empty state
    projects = []
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here is your project overview.</p>
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

