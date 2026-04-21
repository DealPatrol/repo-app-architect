'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BillingSettingsProps {
  stripeConfigured: boolean;
  subscription: {
    status: string;
    plan: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
}

export function BillingSettings({ stripeConfigured, subscription }: BillingSettingsProps) {
  const searchParams = useSearchParams();
  const [loadingAction, setLoadingAction] = useState<'checkout' | 'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isActive = useMemo(() => {
    const status = subscription?.status;
    return status === 'active' || status === 'trialing' || status === 'past_due';
  }, [subscription?.status]);

  const statusText = subscription?.status ?? 'inactive';
  const checkoutState = searchParams.get('checkout');

  const startCheckout = async () => {
    setLoadingAction('checkout');
    setError(null);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });

      const body = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !body?.url) {
        throw new Error(body?.error || 'Unable to start checkout');
      }

      window.location.href = body.url;
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const openPortal = async () => {
    setLoadingAction('portal');
    setError(null);
    try {
      const response = await fetch('/api/payments/portal', { method: 'POST' });
      const body = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !body?.url) {
        throw new Error(body?.error || 'Unable to open billing portal');
      }

      window.location.href = body.url;
    } catch (err) {
      console.error('Billing portal failed:', err);
      setError(err instanceof Error ? err.message : 'Billing portal failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Subscription & billing</h2>
          <p className="text-sm text-muted-foreground">
            Manage plan activation, payment method updates, and subscription lifecycle.
          </p>
        </div>
      </div>

      {!stripeConfigured && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and
          STRIPE_PRICE_ID_PRO.
        </div>
      )}

      {checkoutState === 'success' && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Checkout completed. Your subscription status will refresh automatically after webhook
          processing.
        </div>
      )}

      {checkoutState === 'cancelled' && (
        <div className="rounded-lg border border-muted bg-muted/30 p-3 text-sm text-muted-foreground">
          Checkout was cancelled. You can restart it at any time.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Current plan</p>
          <p className="mt-1 text-lg font-semibold capitalize">{subscription?.plan ?? 'free'}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold capitalize">{statusText.replace('_', ' ')}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs uppercase text-muted-foreground">Period end</p>
          <p className="mt-1 text-lg font-semibold">
            {subscription?.current_period_end
              ? new Date(subscription.current_period_end).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={startCheckout}
          disabled={!stripeConfigured || loadingAction !== null}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          {loadingAction === 'checkout' ? 'Redirecting...' : 'Upgrade to Pro'}
        </Button>

        <Button
          variant="outline"
          onClick={openPortal}
          disabled={!stripeConfigured || !isActive || loadingAction !== null}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          {loadingAction === 'portal' ? 'Opening...' : 'Manage billing portal'}
        </Button>
      </div>

      {subscription?.cancel_at_period_end && (
        <p className="text-sm text-muted-foreground">
          Your subscription is set to cancel at the end of the current billing period.
        </p>
      )}
    </div>
  );
}
