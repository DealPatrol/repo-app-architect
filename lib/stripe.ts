import 'server-only';

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? null;

export const stripePriceByPlan = {
  pro: process.env.STRIPE_PRICE_ID_PRO ?? null,
};

export const isStripeConfigured = Boolean(
  stripeSecretKey &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    stripePriceByPlan.pro
);

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (!stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey);
  }

  return stripeClient;
}

export function getAppBaseUrl(origin?: string | null) {
  if (origin) return origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://localhost:3000';
}
