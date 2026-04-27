import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">You are on the Pro launch path.</h1>
        <p className="mt-4 text-muted-foreground">
          Stripe confirmed the checkout redirect. Once webhooks are connected, this is where CodeVault can
          activate billing entitlements and show plan details.
        </p>
        {session_id ? (
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Checkout session: <span className="font-mono text-foreground">{session_id}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      </Card>
    </main>
  )
}
