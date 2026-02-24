import { getProjectById, getTasksByProject, getProjectMembers } from '@/lib/queries'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users, Settings, Plus, BarChart3, ListTodo, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const tasks = await getTasksByProject(id);
  const members = await getProjectMembers(id);

  const taskStats = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    inReview: tasks.filter((t) => t.status === 'in_review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: project.color }}
            >
              {project.icon || project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground text-sm">{project.description || 'No description'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${id}/settings`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">To Do</p>
          <p className="text-2xl font-bold text-foreground">{taskStats.todo}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-primary">{taskStats.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">In Review</p>
          <p className="text-2xl font-bold text-foreground">{taskStats.inReview}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Done</p>
          <p className="text-2xl font-bold text-emerald-500">{taskStats.done}</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-border">
        <Link href={`/dashboard/projects/${id}`} className="px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary flex items-center gap-2">
          <ListTodo className="h-4 w-4" />
          Overview
        </Link>
        <Link href={`/dashboard/projects/${id}/tasks`} className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 border-b-2 border-transparent hover:border-muted">
          <MessageSquare className="h-4 w-4" />
          Tasks
        </Link>
        <Link href={`/dashboard/projects/${id}/analytics`} className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 border-b-2 border-transparent hover:border-muted">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Tasks</h2>
            <Link href={`/dashboard/projects/${id}/tasks`}>
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </Link>
          </div>

          <Card className="divide-y divide-border">
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No tasks yet. Create one to get started.</p>
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <Link key={task.id} href={`/dashboard/projects/${id}/tasks/${task.id}`}>
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground hover:text-primary">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${
                          task.status === 'done'
                            ? 'bg-emerald-900/30 text-emerald-400'
                            : task.status === 'in_progress'
                              ? 'bg-blue-900/30 text-blue-400'
                              : task.status === 'in_review'
                                ? 'bg-purple-900/30 text-purple-400'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </Card>
        </div>

        {/* Team Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Team</h2>
            <span className="text-sm text-muted-foreground">{members.length} members</span>
          </div>
          <Card className="p-4">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members yet.</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {(member.name?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{member.name || 'Team Member'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
