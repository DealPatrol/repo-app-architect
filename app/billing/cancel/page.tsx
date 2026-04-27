import Link from 'next/link'
import { ArrowLeft, CreditCard, RefreshCcw } from 'lucide-react'

import { AppLogo } from '@/components/app-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <AppLogo />
        <Card className="border-border/80 bg-card/80 shadow-lg">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <RefreshCcw className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl">Checkout canceled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              No payment was completed. You can return to pricing and start a new secure Stripe Checkout session whenever you are ready.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/#pricing">
                  <CreditCard className="h-4 w-4" />
                  Back to pricing
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Return home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
