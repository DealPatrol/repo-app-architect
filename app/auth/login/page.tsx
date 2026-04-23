import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isStackAuthConfigured } from '@/stack';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your workspace to manage projects, profile details, and billing.
        </p>

        {!isStackAuthConfigured && (
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            Stack Auth keys are missing. Set NEXT_PUBLIC_STACK_PROJECT_ID,
            NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY, and STACK_SECRET_SERVER_KEY.
          </div>
        )}

        <Link href="/api/auth/github/login" className="mt-6 block">
          <Button className="w-full gap-2">
            <Github className="h-4 w-4" />
            Continue with GitHub
          </Button>
        </Link>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
