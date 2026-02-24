import Link from 'next/link';
import { ArrowRight, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16">
      <section className="space-y-6 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">TaskFlow SaaS</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Launch-ready onboarding, profiles, and billing
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          New users can sign up, sign in, set up their profile, and manage paid plans from a
          single dashboard experience.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="ghost">
              Go to dashboard
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <UserRound className="h-5 w-5 text-primary" />
          <h2 className="mt-4 font-semibold">Profile management</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Capture display name, company, job title, and timezone so accounts are immediately
            usable.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="mt-4 font-semibold">Payments & subscriptions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start checkout, manage billing portal access, and sync subscription events via webhooks.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="mt-4 font-semibold">Secure auth flow</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Stack Auth handler routes provide robust sign-up, sign-in, and session management.
          </p>
        </div>
      </section>
    </main>
  );
}
