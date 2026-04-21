import { BillingSettings } from '@/components/billing-settings';
import { requireCurrentUser } from '@/lib/auth';
import { getUserSubscription } from '@/lib/queries';
import { isStripeConfigured } from '@/lib/stripe';

export default async function BillingPage() {
  const user = await requireCurrentUser();
  const subscription = await getUserSubscription(user.id);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Configure payments, upgrade plans, and manage your subscription.
        </p>
      </div>

      <BillingSettings
        stripeConfigured={isStripeConfigured}
        subscription={
          subscription
            ? {
                status: subscription.status,
                plan: subscription.plan,
                current_period_end: subscription.current_period_end,
                cancel_at_period_end: subscription.cancel_at_period_end,
              }
            : null
        }
      />
    </div>
  );
}
