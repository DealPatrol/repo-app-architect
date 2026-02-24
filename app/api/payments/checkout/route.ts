import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAppBaseUrl, getStripeServerClient, stripePriceByPlan } from '@/lib/stripe';
import { getUserSubscription, upsertUserSubscription } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripeServerClient();
    const plan = ((await request.json().catch(() => ({}))) as { plan?: string }).plan ?? 'pro';
    const normalizedPlan = plan === 'pro' ? 'pro' : 'pro';
    const priceId = stripePriceByPlan[normalizedPlan];

    if (!stripe || !priceId) {
      return NextResponse.json(
        { error: 'Stripe checkout is not configured.' },
        { status: 500 }
      );
    }

    const existingSubscription = await getUserSubscription(user.id);
    let stripeCustomerId = existingSubscription?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.primaryEmail || undefined,
        name: user.displayName || undefined,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;
    }

    const baseUrl = getAppBaseUrl(request.nextUrl.origin);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan: normalizedPlan,
      },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${baseUrl}/dashboard/billing?checkout=cancelled`,
    });

    await upsertUserSubscription(user.id, {
      stripe_customer_id: stripeCustomerId,
      plan: existingSubscription?.plan ?? 'free',
      status: existingSubscription?.status ?? 'inactive',
      stripe_subscription_id: existingSubscription?.stripe_subscription_id ?? null,
      current_period_end: existingSubscription?.current_period_end ?? null,
      cancel_at_period_end: existingSubscription?.cancel_at_period_end ?? false,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: 'Unable to create checkout URL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}
