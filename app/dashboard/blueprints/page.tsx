import { requireCurrentUser } from '@/lib/auth';
import { getBlueprintsByUser } from '@/lib/queries';
import { BlueprintsPanel } from '@/components/blueprints-panel';

export default async function BlueprintsPage() {
  const user = await requireCurrentUser();
  const blueprints = await getBlueprintsByUser(user.id);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blueprints</h1>
        <p className="mt-2 text-muted-foreground">
          Generate app possibilities directly from GitHub repositories or a pasted file index.
        </p>
      </div>

      <BlueprintsPanel initialBlueprints={blueprints} />
    </div>
  );
}
