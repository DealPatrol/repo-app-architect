import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAppBaseUrl, getStripeServerClient } from '@/lib/stripe';
import { getUserSubscription, upsertUserSubscription } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripeServerClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe billing portal is not configured.' },
        { status: 500 }
      );
    }

    const existingSubscription = await getUserSubscription(user.id);
    let customerId = existingSubscription?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.primaryEmail || undefined,
        name: user.displayName || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await upsertUserSubscription(user.id, {
        stripe_customer_id: customerId,
        status: existingSubscription?.status ?? 'inactive',
        plan: existingSubscription?.plan ?? 'free',
        stripe_subscription_id: existingSubscription?.stripe_subscription_id ?? null,
        current_period_end: existingSubscription?.current_period_end ?? null,
        cancel_at_period_end: existingSubscription?.cancel_at_period_end ?? false,
      });
    }

    const returnUrl = `${getAppBaseUrl(request.nextUrl.origin)}/dashboard/billing`;
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}
