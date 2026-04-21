import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient, stripePriceByPlan } from '@/lib/stripe';
import {
  getUserSubscriptionByCustomerId,
  updateUserSubscriptionByCustomerId,
  upsertUserSubscription,
} from '@/lib/queries';

export const runtime = 'nodejs';

function mapPriceIdToPlan(priceId: string | null | undefined) {
  if (!priceId) return 'free';
  if (priceId === stripePriceByPlan.pro) return 'pro';
  return 'free';
}

function timestampToIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeServerClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe webhook is not configured.' },
        { status: 500 }
      );
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
      const customerId = typeof session.customer === 'string' ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : null;
      const plan = session.metadata?.plan ?? 'pro';

      if (userId && customerId) {
        await upsertUserSubscription(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan,
          cancel_at_period_end: false,
        });
      }
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = mapPriceIdToPlan(priceId);
      const currentPeriodEnd = timestampToIso(subscription.current_period_end);
      const status =
        event.type === 'customer.subscription.deleted'
          ? 'canceled'
          : subscription.status;

      const updated = await updateUserSubscriptionByCustomerId(customerId, {
        stripe_subscription_id: subscription.id,
        status,
        plan,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
      });

      if (!updated) {
        const fromMetadata = subscription.metadata?.user_id;
        if (fromMetadata) {
          await upsertUserSubscription(fromMetadata, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status,
            plan,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });
        } else {
          const existingByCustomer = await getUserSubscriptionByCustomerId(customerId);
          if (existingByCustomer) {
            await upsertUserSubscription(existingByCustomer.user_id, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status,
              plan,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 400 });
  }
}
