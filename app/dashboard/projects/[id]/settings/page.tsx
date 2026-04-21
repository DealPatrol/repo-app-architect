import { TeamSettings } from '@/components/team-settings'
import { Card } from '@/components/ui/card'
import { requireCurrentUser } from '@/lib/auth'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { id: projectId } = await params
  const currentUser = await requireCurrentUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your project and team</p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Project ID</label>
              <input
                type="text"
                value={projectId}
                disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 font-mono text-xs"
              />
            </div>
          </div>
        </Card>

        <TeamSettings projectId={projectId} currentUserId={currentUser.id} />
      </div>
    </div>
  )
}
