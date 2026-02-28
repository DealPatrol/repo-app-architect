import Link from 'next/link';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type OnboardingChecklist } from '@/lib/queries';

interface OnboardingChecklistProps {
  checklist: OnboardingChecklist;
}

export function OnboardingChecklist({ checklist }: OnboardingChecklistProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Get started checklist</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete these steps to unlock your full workspace setup.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {checklist.completedCount}/{checklist.totalCount} complete
        </span>
      </div>

      <div className="space-y-3">
        {checklist.steps.map((step) => (
          <div
            key={step.key}
            className="flex items-start justify-between gap-4 rounded-md border border-border/80 bg-background/40 p-4"
          >
            <div className="flex items-start gap-3">
              {step.completed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {!step.completed && (
              <Link href={step.href}>
                <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap">
                  Open
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
