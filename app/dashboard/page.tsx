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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome{username ? `, @${username}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Discover applications you can build from your existing GitHub code.
        </p>
      </div>

      {/* Connected badge */}
      <Card className="p-4 border-green-500/30 bg-green-950/10 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">GitHub connected</p>
          <p className="text-xs text-muted-foreground">
            Your repositories are accessible for analysis
          </p>
        </div>
        <Github className="h-4 w-4 text-muted-foreground" />
      </Card>

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
          <Button asChild className="mt-auto">
            <Link href="/dashboard/repositories">
              Browse Repositories
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Step 2 — Run AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Claude AI scans your code, detects reusable patterns, and discovers apps you can ship fast.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-auto">
            <Link href="/dashboard/analyses">
              View Analyses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
