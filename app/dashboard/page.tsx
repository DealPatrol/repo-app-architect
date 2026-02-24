import { getProjectsByOrganization } from '@/lib/queries';
import { getCurrentOrganizationId, requireCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Users } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  const orgId = getCurrentOrganizationId(user);
  const projects = orgId ? await getProjectsByOrganization(orgId) : [];

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your project overview.</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
            </div>
            <Folder className="h-8 w-8 text-primary/50" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <Folder className="h-8 w-8 text-primary/50" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold text-foreground">1</p>
            </div>
            <Users className="h-8 w-8 text-primary/50" />
          </div>
        </div>
      </div>

      {/* Projects section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Projects</h2>
          <Link href="/dashboard/projects">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first project to organize your tasks.
            </p>
            <Link href="/dashboard/projects">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group rounded-lg border border-border bg-card p-6 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  >
                    {project.icon || 'P'}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {project.visibility === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
