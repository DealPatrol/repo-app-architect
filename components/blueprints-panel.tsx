'use client';

import { useMemo, useState } from 'react';
import { Sparkles, RefreshCw, FileCode2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type AppBlueprint } from '@/lib/queries';

interface BlueprintsPanelProps {
  initialBlueprints: AppBlueprint[];
}

export function BlueprintsPanel({ initialBlueprints }: BlueprintsPanelProps) {
  const [sourceName, setSourceName] = useState('workspace');
  const [repoFiles, setRepoFiles] = useState('');
  const [blueprints, setBlueprints] = useState(initialBlueprints);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedBlueprints = useMemo(
    () => [...blueprints].sort((a, b) => b.reuse_percentage - a.reuse_percentage),
    [blueprints]
  );

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const files = repoFiles
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const response = await fetch('/api/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceName: sourceName.trim() || 'workspace',
          files,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { blueprints?: AppBlueprint[]; error?: string }
        | null;

      if (!response.ok || !payload?.blueprints) {
        throw new Error(payload?.error || 'Failed to generate blueprints');
      }

      setBlueprints(payload.blueprints);
    } catch (err) {
      console.error('Blueprint generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Generate app blueprints</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste repository file paths (one per line). We will derive buildable app possibilities.
        </p>

        <div className="mt-4 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">Source name</span>
            <input
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="my-org/my-repo"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Repository file list</span>
            <textarea
              value={repoFiles}
              onChange={(e) => setRepoFiles(e.target.value)}
              className="min-h-[180px] w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
              placeholder={'app/page.tsx\napp/api/projects/route.ts\ncomponents/dashboard-shell.tsx\nlib/queries.ts'}
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-4 flex gap-3">
          <Button onClick={generate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate blueprints
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Blueprint possibilities</h2>
          <span className="text-sm text-muted-foreground">
            {sortedBlueprints.length} blueprint{sortedBlueprints.length === 1 ? '' : 's'}
          </span>
        </div>

        {sortedBlueprints.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <Target className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              No blueprints yet. Generate from your repo file index.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedBlueprints.map((bp) => (
              <article key={bp.id} className="rounded-lg border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{bp.source_name}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {bp.reuse_percentage}% reusable
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{bp.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{bp.description}</p>

                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Missing files</p>
                  <ul className="space-y-1">
                    {bp.missing_files.slice(0, 4).map((file) => (
                      <li key={`${bp.id}-${file.path}`} className="flex items-start gap-2 text-sm">
                        <FileCode2 className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          <span className="font-medium">{file.path}</span>
                          <span className="text-muted-foreground"> — {file.purpose}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
