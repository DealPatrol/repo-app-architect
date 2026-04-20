import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Github, Sparkles, FolderGit2, ArrowRight, CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const username = cookieStore.get('github_username')?.value

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

      {/* Quick start steps */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 flex flex-col gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Step 1 — Select Repositories</h3>
            <p className="text-sm text-muted-foreground">
              Choose 2 or more of your GitHub repositories to scan. Both public and private repos work.
            </p>
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
